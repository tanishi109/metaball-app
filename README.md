# annoying app

Metaball Boids run about in your desktop.

# js dev

## run

```
npm start
```

## release

```
npm run release
```

The directory "/Release" will be created.

# rust dev

## compile

```
cd emsdk-portable
source ./emsdk_env.sh

cd /electron-metaball/rust/wasm
cargo build --target wasm32-unknown-emscripten
cp target/wasm32-unknown-emscripten/debug/deps/*.wasm app.wasm
```

The file "/rust/wasm/app.wasm" will be created.

## load from js

move `app.wasm` & `wasm.js` into `src/windows/main/*`
