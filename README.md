# what's this?

Test project for try Electron with Rust (web assembly).
Good performance useless app.

![img](https://github.com/tanishi109/metaball-app/blob/master/readmeAssets/wasm_vs_js.png?raw=true)

## about this app

Metaball Boids run about in your desktop. So annoying.

![img](https://github.com/tanishi109/metaball-app/blob/master/readmeAssets/demo.gif?raw=true)

# For development

## js dev

### run

```
npm start
```

### release

```
npm run release
```

The directory "/Release" will be created.

## rust dev

### compile

```
cd emsdk-portable
source ./emsdk_env.sh

cd /electron-metaball/rust/wasm
cargo build --target wasm32-unknown-emscripten
cp target/wasm32-unknown-emscripten/debug/deps/*.wasm app.wasm
```

The file "/rust/wasm/app.wasm" will be created.

### load from js

move `app.wasm` & `wasm.js` into `src/windows/main/*`
```
cp ./rust/wasm/target/wasm32-unknown-emscripten/debug/wasm.js ./src/windows/main/wasm.js && cp ./rust/wasm/app.wasm ./src/windows/main/app.wasm
```
