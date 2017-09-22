const {
  FuseBox,
  Sparky,
} = require("fuse-box");

const {spawn} = require("child_process");
const isDev = process.env.NODE_ENV !== "production";

Sparky.task("copy-html", () => {
  return Sparky.src("./**/*.html", {base: "./src/windows"}).dest("./dist/windows/");
});

Sparky.task("default", ["copy-html"], () => {
  const fuse = FuseBox.init({
    homeDir: "src",
    sourcemaps: true,
    output: "dist/$name.js",
  });

  if (isDev) {
    fuse.dev({
      port: 8080,
      httpServer: false,
    });

    fuse.bundle("mainProcesses/main")
      .target("electron")
      .watch()
      .instructions(" > [mainProcesses/main.ts]");

    fuse.bundle("windows/main/index")
      .target("electron")
      .watch()
      .instructions(" > [windows/main/index.tsx]");

    return fuse.run().then(() => {
      const child = spawn("node", [`${ __dirname }/node_modules/electron/cli.js`, __dirname ]);

      child.stdout.on('data', function (data) {
        console.log("electron > " + data);
      });
    });
  } else {
    fuse.bundle("mainProcesses/main")
      .target("electron")
      .instructions(" > [mainProcesses/main.ts]");

    fuse.bundle("windows/main/index")
      .target("electron")
      .instructions(" > windows/main/index.tsx");

    return fuse.run();
  }

});