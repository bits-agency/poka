# POKA — Make Promises Programmable

> **Autonomous Economic Agreement Agent for Celo "Agents at Work" Hackathon**

POKA turns natural-language promises and commitments into programmable economic agreements with autonomous monitoring and on-chain settlement on Celo.

---

## ⚡ The Golden Path Loop

```
Natural language instruction
        ↓
POKA understands intent & extracts terms
        ↓
Structured agreement generated
        ↓
User reviews / Agent negotiates terms
        ↓
Funds locked into Celo Escrow
        ↓
POKA Sentinel autonomously monitors condition
        ↓
Condition satisfied & cryptographically verified
        ↓
Settlement executed on Celo Sepolia
        ↓
Attributed on-chain transaction confirmed
```

---

## 🏗️ Architecture

```
USER / AGENT
     ↓
POKA AGENT
     ↓
TOOLS (parseAgreement, negotiate, fundEscrow, verifyCondition, releasePayment)
     ↓
POLICY & PERMISSION LAYER (Limits, caps, autonomous negotiation thresholds)
     ↓
POKA SENTINEL (Autonomous watcher & verification engine)
     ↓
CELO SETTLEMENT LAYER (Celo Sepolia Testnet + Attribution Tag)
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v20+
- npm

### 1. Start Backend Server
```bash
cd server
npm run dev
# Starts on port 3005 (configured to prevent conflicts)
```

### 2. Start Frontend Client
```bash
cd client
npm run dev
# Serves on http://localhost:5173
```

---

## 🌐 Configuration (`server/.env`)

```env
PORT=3005
DEMO_MODE=true
CELO_RPC_URL=https://forno.celo.org
CELO_ATTRIBUTION_TAG=celo_fb00f20ea4e8
CELO_WALLET_ADDRESS=0x26Fe17768374a18db647b4c9eDCDAcff4fA98367
CELO_PRIVATE_KEY= # optional for real live mainnet broadcast
```

---

## 🎨 Visual Design Direction
- **Minimalist, Monochrome, Futuristic, Technical, Premium AI Infrastructure**
- Deep dark palette (`#08080A`), off-white typography, thin borders, restrained acid-green accents (`#00FF66`).
- Terminal telemetry and live Sentinel heartbeat activity.
