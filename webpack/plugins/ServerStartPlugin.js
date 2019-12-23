/* eslint strict: 0, no-console: 0, class-methods-use-this: 0 */
const { spawn } = require('child_process');

class ServerStartPlugin {
  constructor(envs) {
    this.envs = envs;
    this.child = null;
  }

  onStdOut(data) {
    const time = new Date().toTimeString();
    process.stdout.write(time.replace(/.*(\d{2}:\d{2}:\d{2}).*/, '[$1] '));
    process.stdout.write(data);
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync('ServerStartHook', (cp, callback) => {
      if (this.child) {
        this.child.kill('SIGTERM');
      }
      this.child = spawn('node', ['./dist/server.js'], {
        env: {
          ...process.env,
          ...this.envs,
        },
        silent: false,
      });
      console.log('[server]: start server');
      this.child.stdout.on('data', this.onStdOut);
      this.child.stderr.on('data', x => process.stderr.write(x));
      callback();
    });
  }
}

module.exports = ServerStartPlugin;
