const { calculateRelevance } = require('../src/utils/textMatcher');

const tests = [
  // Bug 1: DDR5 vs DDR4
  {
    name: 'Team Elite DDR5 vs DDR4 (should be 0)',
    query: 'Team Elite 8GB DDR5',
    title: 'TEAM ELITE 8GB 3200MHz DDR4 RAM',
    price: 7950,
    expectedZero: true
  },
  {
    name: 'Team Elite DDR5 vs DDR5 (should be positive)',
    query: 'Team Elite 8GB DDR5',
    title: 'Team Elite 8GB 4800MHz DDR5 Desktop RAM',
    price: 16800,
    expectedZero: false
  },

  // Bug 2: B650 vs B450 / B560
  {
    name: 'MSI PRO B650M-B vs B450M (should be 0)',
    query: 'MSI PRO B650M-B',
    title: 'MSI B450M-A PRO MAX II Motherboard',
    price: 8699,
    expectedZero: true
  },
  {
    name: 'MSI PRO B650M-B vs B560M (should be 0)',
    query: 'MSI PRO B650M-B',
    title: 'MSI B560M PRO-E Intel Motherboard',
    price: 12080,
    expectedZero: true
  },
  {
    name: 'MSI PRO B650M-B vs actual B650M (should be positive)',
    query: 'MSI PRO B650M-B',
    title: 'MSI PRO B650M-B DDR5 AMD AM5 Micro-ATX Motherboard',
    price: 14000,
    expectedZero: false
  },

  // Bug 3: SSD 512GB vs 64GB Pen Drive / 256GB SSD
  {
    name: 'Lexar NM620 512GB vs 64GB Pen Drive (should be 0)',
    query: 'Lexar NM620 512GB',
    title: 'Lexar JumpDrive 64GB USB 3.0 Flash Pen Drive',
    price: 1379,
    expectedZero: true
  },
  {
    name: 'Lexar NM620 512GB vs 256GB SSD (should be 0)',
    query: 'Lexar NM620 512GB',
    title: 'Lexar NM620 256GB M.2 NVMe SSD',
    price: 7800,
    expectedZero: true
  },
  {
    name: 'Lexar NM620 512GB vs actual 512GB SSD (should be positive)',
    query: 'Lexar NM620 512GB',
    title: 'Lexar NM620 512GB M.2 2280 PCIe Gen3x4 NVMe SSD',
    price: 11500,
    expectedZero: false
  },

  // Bug 4: Ryzen 5 7600 CPU vs Cooler Fan
  {
    name: 'Ryzen 5 7600 vs Cooler Fan ৳1,733 (should be 0)',
    query: 'Ryzen 5 7600',
    title: 'New AMD Original Fan Radiator Cooler Suit For Ryzen 3 Ryzen 5 Ryzen 7 AM5 AM4 CPU R...',
    price: 1733,
    expectedZero: true
  },
  {
    name: 'Ryzen 5 7600 vs actual Processor ৳17,399 (should be positive)',
    query: 'Ryzen 5 7600',
    title: 'AMD Ryzen 5 7600 Gaming Processor',
    price: 17399,
    expectedZero: false
  },

  // Bug 5: Mac mini ,m6 vs FiberFox Splicer Machine & Dazzle match
  {
    name: 'Mac mini ,m6 vs FiberFox Splicer Machine ৳142,000 (should be 0)',
    query: 'Mac mini ,m6',
    title: 'FiberFox Mini 3S Active V-Groov Clade Splicer Machine',
    price: 142000,
    expectedZero: true
  },
  {
    name: 'Mac mini ,m6 vs Dazzle Apple Mac Mini M6 ৳109,990 (should be positive)',
    query: 'Mac mini ,m6',
    title: 'Apple Mac Mini M6 Chip With 12‑core CPU and 12-core GPU',
    price: 109990,
    expectedZero: false
  }
];

let failed = 0;
console.log('=== RUNNING ZERO-TOLERANCE HARDWARE SPEC TESTS ===\n');

for (const t of tests) {
  const score = calculateRelevance(t.query, t.title, t.price);
  const isZero = score === 0;
  const passed = t.expectedZero ? isZero : !isZero;

  if (passed) {
    console.log(`✅ PASS: ${t.name} (Score: ${score})`);
  } else {
    console.log(`❌ FAIL: ${t.name} (Score: ${score}, Expected zero: ${t.expectedZero})`);
    failed++;
  }
}

console.log(`\nResults: ${tests.length - failed}/${tests.length} passed.`);
if (failed > 0) process.exit(1);
