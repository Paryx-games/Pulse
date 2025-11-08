const { spawn } = require('child_process');

let electronProcess;

const viteProcess = spawn('npm', ['run', 'vite'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

setTimeout(() => {
  electronProcess = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electronProcess.on('exit', (code) => {
    viteProcess.kill();
    process.exit(code);
  });
}, 5000);

viteProcess.on('exit', (code) => {
  if (electronProcess) {
    electronProcess.kill();
  }
  process.exit(code);
});
