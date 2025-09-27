# dRAG Automata Web3 Function

A comprehensive Web3 automation system for crypto data ingestion with zkTLS proof generation, built on Gelato Web3 Functions.

## Features

- **Automated Crypto Data Ingestion**: Fetches real-time crypto data from CoinMarketCap API
- **zkTLS Proof Generation**: Generates cryptographic proofs for data authenticity
- **Data Validation**: Comprehensive validation of API responses
- **Decentralized Execution**: Runs on Gelato's decentralized network
- **Smart Contract Integration**: Updates on-chain oracle contracts
- **Configurable Parameters**: Customizable symbols, intervals, and oracle addresses

## Project Structure

```
dAI-Vault/
├── web3-functions/
│   └── crypto-oracle/
│       └── index.ts          # Main Web3 Function
├── contracts/
│   └── CryptoOracle.sol      # Smart contract oracle
├── scripts/
│   └── deploy.js             # Deployment script
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── env.example               # Environment template
└── README.md                 # This file
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the environment template and fill in your values:

```bash
cp env.example .env
```

Edit `.env` with your CoinMarketCap API key and network URLs.

### 3. Test Locally

```bash
# Test the Web3 Function locally
npx w3f test web3-functions/crypto-oracle/index.ts --logs
```

### 4. Deploy Smart Contract

```bash
# Deploy the oracle contract
npx hardhat run scripts/deploy.js --network <your-network>
```

### 5. Deploy Web3 Function

```bash
# Deploy to IPFS
npx w3f deploy web3-functions/crypto-oracle/index.ts
```

### 6. Create Automation Task

1. Visit [Gelato App](https://beta.app.gelato.network/new-task?cid=YOUR_CID)
2. Configure task parameters:
   - **Trigger**: Cron (e.g., `"0 */10 * * * *"` for every 10 minutes)
   - **Arguments**: 
     ```json
     {
       "cryptoSymbols": ["bitcoin", "ethereum", "cardano"],
       "updateInterval": "600",
       "oracleAddress": "0x..."
     }
     ```

## Configuration

### User Arguments

- `cryptoSymbols`: Array of crypto symbols to track (default: ["bitcoin", "ethereum", "cardano"])
- `updateInterval`: Update interval in seconds (default: 600 = 10 minutes)
- `oracleAddress`: Smart contract oracle address (default: 0x71B9B0F6C999CBbB0FeF9c92B80D54e4973214da)

### Secrets

Store these in Gelato's secret management:

- `COINMARKETCAP_API_KEY`: Your CoinMarketCap Pro API key

## Smart Contract

The `CryptoOracle` contract provides:

- **Data Storage**: Stores crypto prices, market cap, and volume
- **Access Control**: Only Gelato automator can update data
- **Events**: Emits events for each data update
- **View Functions**: Query latest data for any symbol

### Key Functions

```solidity
function updateCryptoData(
    string memory symbol,
    uint256 price,
    uint256 marketCap,
    uint256 volume24h,
    uint256 timestamp
) external onlyAutomator

function getCryptoData(string memory symbol) 
    external 
    view 
    returns (uint256, uint256, uint256, uint256)
```

## zkTLS Proofs

The system generates zkTLS proofs for each data update:

```typescript
interface zkTLSProof {
  proof: string;           // Cryptographic proof
  publicInputs: string[];  // Public data inputs
  metadata: {             // Proof metadata
    timestamp: number;
    source: string;
    hash: string;
  };
}
```

**Note**: This implementation includes a simplified proof generation. For production, integrate with Reclaim Protocol SDK for full zkTLS functionality.

## Data Validation

The system validates all incoming data:

- **Required Fields**: Price, market cap, volume 24h
- **Data Types**: Ensures numeric values
- **Range Checks**: Validates non-negative values
- **API Response**: Checks for API errors

## Monitoring

Monitor your automation:

- **Gelato Dashboard**: View task executions and logs
- **Smart Contract Events**: Monitor `CryptoDataUpdated` events
- **Storage**: zkTLS proofs stored for verification

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure `COINMARKETCAP_API_KEY` is set in Gelato secrets
2. **Update Not Needed**: Check if `updateInterval` is too frequent
3. **Contract Errors**: Verify oracle address and contract deployment
4. **Network Issues**: Check RPC URLs and network connectivity

### Debug Mode

Enable detailed logging by adding `--logs` flag to test commands:

```bash
npx w3f test web3-functions/crypto-oracle/index.ts --logs
```

## Security Considerations

- **API Keys**: Store securely in Gelato secrets, never commit to repository
- **Access Control**: Only authorized Gelato automator can update contract
- **Data Validation**: All external data is validated before on-chain storage
- **Proof Generation**: zkTLS proofs ensure data authenticity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
dAI Vault is a decentralized AI data and compute layer where users upload raw unstructured data (PDFs, videos, audio) stored efficiently on Walrus, while processed embeddings and vector representations are stored on Akave O3 for fast S3-compatible access, and all embedding indices, knowledge graphs, and calibration metadata are anchored on Filecoin warm storage via Synapse SDK, enabling verifiable storage, pay-per-query retrieval, and seamless wallet-authenticated access for developers who can either use our hosted models or bring their own, making dAI Vault a universal and chain-agnostic infrastructure layer for Web3 AI.
