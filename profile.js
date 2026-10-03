const Module = require('module');
const originalRequire = Module.prototype.require;

const times = [];

Module.prototype.require = function(request) {
  const start = process.hrtime.bigint();
  const result = originalRequire.apply(this, arguments);
  const end = process.hrtime.bigint();
  
  const timeMs = Number(end - start) / 1000000;
  times.push({ request, timeMs });
  return result;
};

process.on('exit', () => {
  times.sort((a, b) => b.timeMs - a.timeMs);
  console.log('\n--- Require Time Audit (Top 50 Slowest Modules) ---');
  times.slice(0, 50).forEach(t => {
    console.log(`${t.timeMs.toFixed(2)} ms - ${t.request}`);
  });
});

console.log("Registering TS compiler...");
// Register tsx so that we can require app.ts directly
require('tsx/cjs');

console.log("Loading app.ts...");
require('./app.ts');

setTimeout(() => {
  console.log("\nServer started, exiting for profile...");
  process.exit(0);
}, 15000);
