# 🤖 BD Price Sentinel - Agent Architecture & Multi-Engine Specification (AGENTS.md)

This document defines the agent architecture, specialized scraping roles, strict hardware specification validation rules, and anti-hallucination protocols powering **দাম কত BD (BD Price Sentinel)**.

---

## 🏛️ System Architecture & Specialist Agents

```
                                [ User Request / URL / Keyword ]
                                               │
                                 ┌─────────────┴─────────────┐
                                 ▼                           ▼
                    [Query Distiller Agent]      [Direct URL Inspector Agent]
                                 │                           │
                                 └─────────────┬─────────────┘
                                               ▼
                                  [Multi-Store Parallel Hub]
              ┌──────────────────┬─────────────┴────────────┬──────────────────┐
              ▼                  ▼                          ▼                  ▼
      [StarTech Agent]     [Daraz Agent]              [Ryans Agent]      [Skyland Agent]
              │                  │                          │                  │
              └──────────────────┴─────────────┬────────────┴──────────────────┘
                                               ▼
                              [Universal BD Web Sentinel Agent]
                              (Sweeps all .bd tech & ecommerce)
                                               │
                                               ▼
                           [Hardware Strict Spec Verifier Agent]
                           - Memory Gen Filter (DDR5 vs DDR4)
                           - Chipset Matcher (B650 vs B550/B450)
                           - Storage Capacity Matcher (512GB vs 64GB/256GB)
                           - CPU Accessory Purger (Coolers/Fans vs CPUs)
                           - Exact Numeric Model Anchor Enforcement
                                               │
                                               ▼
                           [Best Value & Telemetry Ranker Agent]
                           - 🥇 Top 1 Winner (Cheapest Verified In-Stock)
                           - 🥈 Top 2 Runner-up
                           - 🥉 Top 3 Budget Pick
                           - Side-by-Side 3-Way Comparison Matrix
                                               │
                                               ▼
                             [Neumorphic Dual-Theme UI Engine]
```

---

## 🛡️ Strict Hardware Specification Validation Protocols (Zero-Tolerance Rules)

### Rule 1: Memory Generation Isolation (DDR5 vs DDR4 vs DDR3)
* If query specifies `DDR5` (e.g. `Team Elite 8GB DDR5`):
  * Products containing `DDR4`, `DDR3`, or lacking `DDR5` are **STRICTLY DISQUALIFIED**.
* If query specifies `DDR4`:
  * Products containing `DDR5` or `DDR3` are **STRICTLY DISQUALIFIED**.

### Rule 2: Chipset / Motherboard Architecture Lock
* If query specifies a motherboard chipset (e.g. `B650`, `B650M`, `B550`, `B450`, `B760`, `Z790`):
  * The product title **MUST** contain that exact chipset family.
  * Any competing generation (e.g. `B450M` or `B560M` when querying `B650M-B`) is **STRICTLY DISQUALIFIED**.

### Rule 3: Storage Capacity Exact Matching (SSD / NVMe vs Flash Drives)
* If query specifies a capacity token (e.g. `512GB`, `1TB`, `2TB`, `256GB`, `8GB`, `16GB`, `32GB`):
  * Products with mismatched capacities (e.g. `64GB`, `128GB`, `256GB` when asking for `512GB`) are **STRICTLY DISQUALIFIED**.
* If query specifies `SSD`, `NVMe`, `M.2`, or `NM620`:
  * Accessories, flash drives, pen drives, memory cards, and USB thumb drives are **STRICTLY PURGED**.

### Rule 4: CPU Processor vs CPU Cooler/Accessory Purge
* If query is for a CPU (e.g. `Ryzen 5 7600`, `Core i5 13400`):
  * Products titled with `Cooler`, `Fan`, `Radiator`, `Heatsink`, `Thermal Paste`, `Bracket`, `Suit for Ryzen`, `For Ryzen` are **STRICTLY PURGED**.
  * A desktop processor cannot be priced below realistic hardware thresholds (e.g. min ৳8,000 BDT for modern CPUs).

### Rule 5: Exact Numeric Model Match
* Hardware numeric identifiers (e.g. `7600`, `5600`, `4060`, `620`, `225`, `650`) present in the user query **MUST** be present in the candidate product title. Competing numbers (e.g. `7500` vs `7600`, `450` vs `650`) are rejected.

---

## 🎨 Neumorphic Design System Standards

* **Soft Extruded 3D Surfaces**: Double-drop shadows creating tactile convex surfaces.
* **Light Theme**:
  * Background: Soft Neumorphic Slate `#e2e8f0`
  * Shadow Top-Left: Light reflective `#ffffff`
  * Shadow Bottom-Right: Soft dark `#cad3df`
  * Text Contrast: Ultra-sharp `#0f172a` (slate-900) and `#1e293b` (slate-800) with AA/AAA compliance. Zero washed-out text!
* **Dark Theme**:
  * Background: Deep Neumorphic Night `#0d131f`
  * Shadow Top-Left: `#182236`
  * Shadow Bottom-Right: `#06090f`
  * Accents: Vibrant Emerald `#10b981` & Cyan `#06b6d4`
