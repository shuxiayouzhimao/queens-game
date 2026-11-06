// 压力测试：直接从 index.html 提取真实算法代码运行，确保测的就是线上逻辑
const fs = require("fs");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const m = html.match(/\/\* ============ ALGO START ============ \*\/([\s\S]*?)\/\* ============ ALGO END ============ \*\//);
if (!m) { console.error("FAIL: 找不到 ALGO 区块"); process.exit(1); }
eval(m[1]);

// 独立检查器：验证 sol 在 regions 下是合法解
function checkSolution(n, sol, regions) {
  if (new Set(sol).size !== n) return "列重复";
  const regs = sol.map((c, r) => regions[r][c]);
  if (new Set(regs).size !== n) return "区域重复";
  for (let r = 1; r < n; r++) if (Math.abs(sol[r] - sol[r - 1]) <= 1) return "皇后相邻";
  return null;
}
// 检查区域：数量=n、全覆盖、连通、每区恰含一个皇后
function checkRegions(n, regions, sol) {
  const seen = new Set();
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const g = regions[r][c];
    if (g < 0 || g >= n) return "区域编号越界";
    seen.add(g);
  }
  if (seen.size !== n) return "区域数量不为 n";
  for (let g = 0; g < n; g++) {
    // 连通性 BFS
    let start = null;
    for (let r = 0; r < n && !start; r++) for (let c = 0; c < n; c++) if (regions[r][c] === g) { start = [r, c]; break; }
    const vis = new Set([start[0] * n + start[1]]);
    const q = [start];
    while (q.length) {
      const [r, c] = q.pop();
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc]) => {
        if (rr>=0 && rr<n && cc>=0 && cc<n && regions[rr][cc]===g && !vis.has(rr*n+cc)) { vis.add(rr*n+cc); q.push([rr,cc]); }
      });
    }
    let size = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (regions[r][c] === g) size++;
    if (vis.size !== size) return `区域 ${g} 不连通`;
  }
  return null;
}

let total = 0, unique = 0, errors = 0, maxMs = 0;
const ROUNDS = process.argv[2] ? +process.argv[2] : 60;
for (const n of [5, 6, 7, 8, 9, 10, 11]) {
  for (let i = 0; i < ROUNDS; i++) {
    const t0 = Date.now();
    const p = generatePuzzle(n);
    const ms = Date.now() - t0;
    maxMs = Math.max(maxMs, ms);
    total++;
    let err = p ? checkSolution(n, p.sol, p.regions) || checkRegions(n, p.regions, p.sol) : "生成失败";
    if (err) { console.error(`n=${n} 第${i}次: ${err}`); errors++; continue; }
    if (countSolutions(n, p.regions, 2) === 1) unique++;
    else console.warn(`n=${n} 第${i}次: 非唯一解(fallback)`);
  }
}
console.log(`\n共 ${total} 局 | 唯一解 ${unique} (${(100*unique/total).toFixed(1)}%) | 错误 ${errors} | 单局生成最慢 ${maxMs}ms`);
process.exit(errors ? 1 : 0);
