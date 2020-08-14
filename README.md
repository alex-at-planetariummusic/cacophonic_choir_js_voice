# Run in develop mode

- Copy sound files to `assets/sounds`

```
$ npm install
$ npm run start
```

# Build for Unity

- First build the bundle:
```
$ npm run build
```
- Copy `dist/cc-unity.js` to the root of the Unity WebGL build directory (the same directory as `index.html`)
- Add this to index.html, before the other `<script>` tags:
```
<script src="cc-unity.js"></script>
```
- Add a "play" button (recent browsers block audio until the user has interacted with the page, so we can't start the audio immediately. We may want to think about the best way to implement this. We may also want a "pause" button so that people can interact with the work without hearing the audio))
```
<button id="play">play</button>
```
- add the sound files to the build directory; they should be in `assets/sounds`

# TODO

- Turn off `Speaker` when distance is far
- Multi-agent test (test bandwidth)
- Scale distance (maybe to 5x5 grid?)
- Smooth out speaker location changes `Speaker`

# TODO 2nd round
- Stutter backwards