// 启动脚本，使用nodemon运行后端服务
const { spawn } = require('child_process');
const path = require('path');

// 确定Node.js解释器路径
const nodePath = process.argv[0];

// 启动nodemon运行server.js
const nodemon = spawn(nodePath, [
  require.resolve('nodemon/bin/nodemon'),
  'server.js'
], {
  cwd: path.dirname(__filename),
  stdio: 'inherit'
});

// 监听退出事件
nodemon.on('exit', (code) => {
  console.log(`后端服务已退出，退出码: ${code}`);
});

// 监听错误事件
nodemon.on('error', (error) => {
  console.error('启动后端服务时出错:', error);
});

// 优雅退出处理
process.on('SIGINT', () => {
  console.log('正在停止后端服务...');
  nodemon.kill('SIGINT');
});