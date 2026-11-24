const test = require('node:test');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const camera = import(pathToFileURL(path.resolve(__dirname, '../world-camera.js')).href);
const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));

test('the camera physically crosses the library opening into the same river valley', async () => {
  const {cameraPose} = await camera;
  const inside = cameraPose(.11).position;
  const outside = cameraPose(.18).position;
  assert.ok(inside[2] < 0 && outside[2] > 0);
  for (let t = .11; t <= .18; t += .001) {
    const position = cameraPose(t).position;
    assert.ok(Math.abs(position[0]) < 3, 'camera fits the physical arch width');
    assert.ok(position[1] > 6 && position[1] < 13, 'camera clears floor and arch');
  }
  assert.ok(cameraPose(.55).position[2] > 30, 'the same route reaches the river');
});

test('forward and reverse scrubbing sample the identical continuous spatial path', async () => {
  const {cameraPose} = await camera;
  const forward = Array.from({length: 1001}, (_, i) => cameraPose(i / 1000));
  for (let i = 1000; i >= 0; i--) {
    assert.deepEqual(cameraPose(i / 1000), forward[i]);
    assert.ok(forward[i].position.every(Number.isFinite));
    if (i) assert.ok(distance(forward[i].position, forward[i - 1].position) < .5);
  }
});

test('camera position and view direction remain continuous across every region boundary', async () => {
  const {cameraPose, cameraStops} = await camera;
  for (const [time] of cameraStops.slice(1, -1)) {
    const a = cameraPose(time - 1e-7);
    const b = cameraPose(time + 1e-7);
    assert.ok(distance(a.position, b.position) < .0001);
    assert.ok(distance(a.target, b.target) < .0001);
  }
  assert.deepEqual(cameraPose(-1), cameraPose(0));
  assert.deepEqual(cameraPose(2), cameraPose(1));
});
