# Living World source

The geometry, procedural colour maps and camera route are authored in `build_world.py`. They share one Blender Z-up coordinate system in metres. The camera crosses the physical room opening at Y=0. Both river sections meet the waterfall at Y=-52. The route remains in the same scene for the final elevated view.

Recreate with Blender 4.3.2 and its bundled NumPy.

```sh
blender -b --python world-source/build_world.py -- /absolute/output
blender -b --python world-source/render_film.py -- /absolute/output/living-world.blend /absolute/frames 0 360
python3 world-source/denoise_film.py /absolute/frames /absolute/clean 360
ffmpeg -framerate 12 -i /absolute/clean/%04d.png -c:v libx264 -preset slow -crf 22 -g 1 -pix_fmt yuv420p -movflags +faststart world-film.mp4
```

The film is 960×540 at 12 rendered frames per second for 30 seconds. OpenImageDenoise removes Monte Carlo noise, with no replacement of scene content. Install the external processing dependencies from PyPI with `python3 -m pip install oidn==0.2.1 Pillow numpy`. Built-in Blender denoising is disabled because the execution environment's Blender build lacks OpenImageDenoise.

`world-camera.js` samples the same authoring camera coordinates for the optional real-time Three.js review. Blender Z-up converts to browser Y-up as `[x,z,-y]`. The intro ends at camera progress 0.18. The film maps this point to 4.9 seconds and the remainder to 30 seconds.

For the compact optional WebGL model, optimize the GLB with `@gltf-transform/cli@4.2.1`, using quantization, WebP textures, no simplification and no palette merging. Gzip the output into `world-model.bin`. The browser decompresses this standard gzip stream without WebAssembly. Three.js 0.180.0 is self-hosted with its MIT license in `THREE-LICENSE.txt`. No external model or photographic environment is embedded.

The scene is a procedural 3D prototype. Terrain, foliage and water still need visual refinement to meet the requested near-photorealistic standard. The cloud test browser reports WebGL disabled, so real-time GPU rendering is unverified there. The pre-rendered camera film uses the actual Blender scene and provides the browser-compatible path.
