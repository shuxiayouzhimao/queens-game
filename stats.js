const fs = require("fs");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const m = html.match(/\/\* ============ ALGO START ============ \*\/([\s\S]*?)\/\* ============ ALGO END ============ \*\//);
eval(m[1]);

for (const n of [6, 7, 8, 9, 10, 11]) {
  let unique = 0, total = 100, maxMs = 0, sumMs = 0;
  for (let i = 0; i < total; i++) {
    const t0 = Date.now();
    const p = generatePuzzle(n);
    const ms = Date.now() - t0;
    maxMs = Math.max(maxMs, ms); sumMs += ms;
    if (countSolutions(n, p.regions, 2) === 1) unique++;
  }
  console.log(`n=${n}\t唯一 ${unique}/${total}\t平均 ${Math.round(sumMs/total)}ms\t最慢 ${maxMs}ms`);
}
