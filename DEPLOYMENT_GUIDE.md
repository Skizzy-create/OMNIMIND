# 🚀 CryptoOracle Contract Deployment Guide

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MetaMask** or another Web3 wallet
3. **Testnet ETH** (for gas fees)
4. **CoinMarketCap API Key** (for Web3 Function)

## 🌐 Deployment Options

### Option 1: Remix IDE (Recommended for Beginners)

#### Step 1: Open Remix IDE
- Go to [https://remix.ethereum.org](https://remix.ethereum.org)
- Create a new workspace called "CryptoOracle"

#### Step 2: Create Contract File
1. Create new file: `contracts/CryptoOracle.sol`
2. Copy the contract code from `contract/contracts/CryptoOracle.sol`

#### Step 3: Compile Contract
1. Go to "Solidity Compiler" tab
2. Set compiler version to `0.8.19`
3. Click "Compile CryptoOracle.sol"

#### Step 4: Deploy Contract
1. Go to "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask"
3. Choose your network (Sepolia recommended)
4. In constructor field, enter: `0x527a819db1eb0e34426297b03bae11F2f8B3A19E`
5. Click "Deploy"
6. Confirm transaction in MetaMask

#### Step 5: Verify Deployment
1. Copy the deployed contract address
2. Update your `.env` file:
   ```
   ORACLE_ADDRESS=0x[your-contract-address]
   ```

---

### Option 2: Hardhat (Advanced)

#### Step 1: Install Dependencies
```bash
cd contract
npm install
```

#### Step 2: Set Environment Variables
```bash
# Copy environment file
cp env.example .env

# Edit .env file with your details
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

#### Step 3: Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

### Option 3: Foundry (Advanced)

#### Step 1: Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### Step 2: Initialize Project
```bash
forge init crypto-oracle
cd crypto-oracle
```

#### Step 3: Deploy Contract
```bash
forge create CryptoOracle --constructor-args 0x527a819db1eb0e34426297b03bae11F2f8B3A19E --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

---

## 🤖 Web3 Function Deployment

### Step 1: Install Web3 Functions CLI
```bash
npm install -g @gelatonetwork/web3-functions-sdk
```

### Step 2: Deploy Web3 Function
```bash
cd contract
npx w3f deploy web3-functions/crypto-oracle/index.ts
```

### Step 3: Configure Secrets
1. Go to [Gelato Dashboard](https://app.gelato.network/)
2. Navigate to "Secrets" section
3. Add your CoinMarketCap API key:
   - Key: `COINMARKETCAP_API_KEY`
   - Value: `your_api_key_here`

### Step 4: Create Task
1. In Gelato Dashboard, create new task
2. Select your deployed Web3 Function
3. Set task parameters:
   ```json
   {
     "cryptoSymbols": ["bitcoin", "ethereum", "cardano"],
     "updateInterval": "600",
     "oracleAddress": "0x[your-contract-address]"
   }
   ```

---

## 🔧 Configuration

### Environment Variables
```bash
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key

# Contract Addresses
ORACLE_ADDRESS=0x[deployed-contract-address]

# API Keys
COINMARKETCAP_API_KEY=your_api_key
```

### Contract Parameters
- **Gelato Automator**: `0x527a819db1eb0e34426297b03bae11F2f8B3A19E`
- **Update Interval**: 600 seconds (10 minutes)
- **Supported Cryptos**: Bitcoin, Ethereum, Cardano

---

## 🧪 Testing Deployment

### Test Contract Functions
```javascript
// Get crypto data
const data = await oracle.getCryptoData("bitcoin");
console.log("Bitcoin data:", data);

// Check last updated
const lastUpdate = await oracle.lastUpdated("bitcoin");
console.log("Last update:", new Date(lastUpdate * 1000));
```

### Monitor Web3 Function
1. Check Gelato Dashboard for task execution
2. Monitor contract events for data updates
3. Verify data accuracy against CoinMarketCap

---

## 📊 Expected Results

After successful deployment, you should have:

1. **Deployed Contract** with address on your chosen network
2. **Web3 Function** running on Gelato
3. **Automated Updates** every 10 minutes
4. **Real-time Crypto Data** available on-chain

### Contract Events
- `CryptoDataUpdated` events emitted for each update
- Data accessible via `getCryptoData()` function
- Timestamps tracked in `lastUpdated` mapping

---

## 🆘 Troubleshooting

### Common Issues
1. **Compilation Errors**: Ensure Solidity version 0.8.19
2. **Deployment Fails**: Check network connection and gas fees
3. **Web3 Function Fails**: Verify API key and network access
4. **No Updates**: Check Gelato task status and logs

### Support Resources
- [Gelato Documentation](https://docs.gelato.network/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Remix IDE](https://remix.ethereum.org)

---

## 🎯 Next Steps

1. **Monitor** contract for data updates
2. **Integrate** with your frontend application
3. **Scale** by adding more cryptocurrencies
4. **Optimize** update intervals based on needs

Your CryptoOracle is now ready to provide real-time, verifiable crypto data to your applications! 🚀
