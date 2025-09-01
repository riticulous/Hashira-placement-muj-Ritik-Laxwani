
'use strict';

const fs = require('fs');

function bigintGcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

class Frac {
  constructor(num, den = 1n) {
    if (den === 0n) throw new Error("zero denominator");
    if (den < 0n) { num = -num; den = -den; }
    const g = bigintGcd(num < 0n ? -num : num, den);
    this.n = num / g;
    this.d = den / g;
  }
  static fromBigInt(x) { return new Frac(BigInt(x), 1n); }
  add(b) {
    const n = this.n * b.d + b.n * this.d;
    const d = this.d * b.d;
    return new Frac(n, d);
  }
  sub(b) {
    const n = this.n * b.d - b.n * this.d;
    const d = this.d * b.d;
    return new Frac(n, d);
  }
  mul(b) {
    return new Frac(this.n * b.n, this.d * b.d);
  }
  div(b) {
    if (b.n === 0n) throw new Error("division by zero fraction");
    return new Frac(this.n * b.d, this.d * b.n);
  }
  isZero() { return this.n === 0n; }
  equals(b) { return this.n === b.n && this.d === b.d; }
  toString() {
    if (this.d === 1n) return this.n.toString();
    return this.n.toString() + '/' + this.d.toString();
  }
}

function readStdin() {
  return fs.readFileSync(0, 'utf8');
}

function parseDigit(ch) {
  if (ch >= '0' && ch <= '9') return BigInt(ch.charCodeAt(0) - 48);
  const lower = ch.toLowerCase();
  if (lower >= 'a' && lower <= 'z') return BigInt(lower.charCodeAt(0) - 97 + 10);
  throw new Error("invalid digit char: " + ch);
}

function parseValueInBase(str, base) {
  let b = BigInt(base);
  let acc = 0n;
  for (let i = 0; i < str.length; ++i) {
    const d = parseDigit(str[i]);
    acc = acc * b + d;
  }
  return acc;
}

function buildPoints(obj) {
  const keysObj = obj['keys'];
  if (!keysObj) throw new Error("missing keys");
  const n = parseInt(keysObj.n, 10);
  const k = parseInt(keysObj.k, 10);
  const pts = [];
  for (const key of Object.keys(obj)) {
    if (key === 'keys') continue;
    const rec = obj[key];
    if (!rec || typeof rec.base === 'undefined' || typeof rec.value === 'undefined') continue;
    const x = BigInt(key); 
    const base = parseInt(rec.base, 10);
    const valueStr = rec.value;
    const y = parseValueInBase(valueStr, base);
    pts.push({ x: x, y: y, label: key });
  }
  return { n, k, pts };
}


function* combinations(arr, r) {

  const n = arr.length;
  if (r > n) return;
  const idx = Array.from({ length: r }, (_, i) => i);
  while (true) {
    yield idx.map(i => arr[i]);

    let i = r - 1;
    while (i >= 0 && idx[i] === i + n - r) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < r; ++j) idx[j] = idx[j - 1] + 1;
  }
}


function solveVandermonde(pointsSubset) {
  const k = pointsSubset.length;

  const A = Array(k);
  for (let i = 0; i < k; ++i) {
    A[i] = Array(k + 1);
    const x = pointsSubset[i].x;

    let power = 1n;
    for (let j = 0; j < k; ++j) {
      A[i][j] = new Frac(power, 1n);
      power = power * x;
    }
    A[i][k] = new Frac(pointsSubset[i].y, 1n); // RHS
  }


  const n = k;
  for (let col = 0; col < n; ++col) {

    let pivot = -1;
    for (let r = col; r < n; ++r) {
      if (!A[r][col].isZero()) { pivot = r; break; }
    }
    if (pivot === -1) return null; 
    if (pivot !== col) {
      const tmp = A[col]; A[col] = A[pivot]; A[pivot] = tmp;
    }
 
    const pv = A[col][col];
    for (let j = col; j <= n; ++j) A[col][j] = A[col][j].div(pv);

    for (let r = col + 1; r < n; ++r) {
      const factor = A[r][col];
      if (!factor.isZero()) {
        for (let j = col; j <= n; ++j) {
          A[r][j] = A[r][j].sub(factor.mul(A[col][j]));
        }
      }
    }
  }


  const sol = Array(n).fill(null);
  for (let i = n - 1; i >= 0; --i) {
    let acc = A[i][n]; 
    for (let j = i + 1; j < n; ++j) {
      acc = acc.sub(A[i][j].mul(sol[j]));
    }
    sol[i] = acc.div(A[i][i]); 
  }
  return sol; 
}

function main() {
  const raw = readStdin();
  const parsed = JSON.parse(raw);
  const { n, k, pts } = buildPoints(parsed);

  if (pts.length < k) {
    console.error("Not enough points to determine polynomial (need k points).");
    process.exit(2);
  }

  let foundSolution = null;
  const tryComb = combinations(pts, k);
  for (const subset of tryComb) {

    const setx = new Set(subset.map(p => p.x.toString()));
    if (setx.size !== subset.length) continue;
    const sol = solveVandermonde(subset);
    if (sol === null) continue;

    const allInt = sol.every(fr => fr.d === 1n);
    if (allInt) {
      foundSolution = { sol, subset };
      break;
    }
  }

  if (!foundSolution) {
    let chosen = [];
    for (const p of pts) {
      if (!chosen.find(q => q.x === p.x)) chosen.push(p);
      if (chosen.length === k) break;
    }
    const sol = solveVandermonde(chosen);
    if (!sol) {
      console.error("Could not solve the Vandermonde system for any subset.");
      process.exit(3);
    }
 
    console.log("RATIONAL_SOLUTION");
    console.log(sol.map(fr => fr.toString()).join(' '));
    return;
  }


  const coeffs = foundSolution.sol.map(fr => fr.n.toString()); 
  console.log(coeffs.join(' '));
}

main();
