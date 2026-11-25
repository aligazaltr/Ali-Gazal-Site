# Living World · continued quality pass

This continues the world at PR #33 / `7072ef582e1b8cf5db8699f3d406bbc8267a5b61`. The room, physical arch at Y=0, valley, river, terrace, bridge and waterfall remain in the same Blender Z-up coordinate system, in metres. No photographs or AI environment images are used in the film.

## Exact scene

`living-world-refined.blend` is a compressed native Blender 4.3.2 file. It includes packed textures, original page artwork, a 720-frame camera timeline and named story markers. Open it directly in Blender; no external download is required. `authored-page.png` is an original essay texture, not a scanned third-party book.

The refinement source is `refine_world.py`. To rebuild from the original geometry:

```sh
blender -b --python world-source/build_world.py -- /absolute/base-world
blender -b --python world-source/refine_world.py -- /absolute/base-world/living-world.blend /absolute/refined-world
blender -b --python world-source/bake_camera_route.py -- /absolute/refined-world/living-world-refined.blend /absolute/refined-world/world-camera.json /absolute/refined-world/living-world-refined.blend
```

For this continuation the preserved `living-world-final.blend` from the preceding authoring session was the input. Refinement does not clear the world or replace it with a new scene.

## Camera and production

`render_quality_film.py` renders 720 distinct 1920×1080 frames at 24 fps, over 30 seconds. Both position and look target now use nonuniform cubic Hermite interpolation, preserving continuous velocity at the authored waypoints. `world-camera.js` uses the same stops and interpolation for geometry review. The first 4.9 seconds end at route progress .18. The rest of the same route ends at 30 seconds. Water normals, water geometry, falling-water turbulence, olive movement and sunlight change over time.

```sh
blender -b --python world-source/render_quality_film.py -- /absolute/refined-world/living-world-refined.blend /absolute/raw 0 720 1920 1080 4 24
python3 world-source/denoise_quality_film.py /absolute/raw /absolute/clean 0 720
python3 world-source/grade_quality_film.py /absolute/clean /absolute/graded 0 720 24
ffmpeg -framerate 24 -i /absolute/graded/%04d.png -c:v libx264 -preset slow -crf 19 -maxrate 6M -bufsize 6M -g 6 -bf 0 -pix_fmt yuv420p -movflags +faststart world-film.mp4
```

The rendering environment has CPU rendering and no usable GPU. The review film uses 4 Cycles samples per pixel, geometry/albedo-guided OpenImageDenoise in linear HDR, followed by a fixed ACES display transform and continuous exposure grade. This is a substantial resolution and cadence increase over the previous 960×540 / 12 fps film, but it is still a procedural visual prototype. Low sample counts and denoising limit fine foliage, reflections and temporal stability. Photorealistic acceptance must be judged from the delivered motion, separately from automated test results. High sample still checks are not represented as the sample count of the complete film.

Processing dependencies: `OpenEXR`, `oidn==0.2.1`, NumPy and Pillow. `--discard-raw` optionally removes scratch EXR frames after validated denoising. To resume an interrupted render whose EXRs have been discarded, set `WORLD_CLEAN_DIR` to the completed clean PNG directory. This avoids re-rendering completed frames; it never interpolates or duplicates them.

## Browser

The homepage prioritizes the authored Blender film on every device. The optional Three.js geometry inspection remains separate in `world-review.html`. This avoids replacing the higher-quality film with a simpler model just because WebGL happens to be available. GPU failure does not block the homepage.

`world-home.js` binds the automatic opening to the film clock, then maps real document scroll anchors to the same media timeline. `canplay` is idempotent, including after seeks. If a preview proxy ignores byte-range requests, the same film is fully buffered into a local media object before cinematic control is enabled. CSP permits same-origin media and local media objects; script and connection policies are otherwise preserved. Reduced motion, JavaScript failure and media failure retain readable HTML and the authored 3D poster. No physical Android test is claimed.

The original build and render scripts remain for provenance. Three.js 0.180.0 remains self-hosted under the MIT license in `THREE-LICENSE.txt`. The refined native source is excluded from web deployment by the release allowlist. Main and production are outside this work's scope.

The preview encode caps delivery bitrate at 6 Mbit/s to fit the static host per-file limit. Native resolution and distinct rendered frame count are retained. The Blender source supports higher-sample re-renders. No frame interpolation or AI upscaling is used.
