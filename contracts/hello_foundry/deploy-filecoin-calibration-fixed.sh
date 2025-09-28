#!/bin/bash

# Deploy to Filecoin Calibration Testnet with Fixed Gas Settings
# This script addresses the gas limit issues encountered on Filecoin

set -e

echo "🚀 Deploying dAI-Vault to Filecoin Calibration Testnet with Fixed Gas Settings"
echo "=================================================================="

# Set private key directly (replace with your actual private key)
export PRIVATE_KEY="0x41c80d358529c1ecddb851ef91cc44739bf7cac3f2910147e791f815b623312c"

# Set optional Etherscan API key for verification (can be left empty)
export ETHERSCAN_API_KEY=""

echo "✅ Private key configured"
echo "📝 Using gas limit: 10,000,000 (10M gas)"
echo "📝 Using gas price: 2,000,000,000 (2 gwei)"
echo "🔗 Using RPC: https://rpc.ankr.com/filecoin_testnet"
echo ""

# Deploy with explicit gas settings
echo "🔧 Deploying contracts with Filecoin-optimized gas settings..."

forge script script/DeployFilecoinCalibration.s.sol:DeployFilecoinCalibration \
    --rpc-url https://rpc.ankr.com/filecoin_testnet \
    --broadcast \
    --gas-limit 10000000 \
    --gas-price 2000000000 \
    --legacy

echo ""
echo "✅ Deployment completed!"
echo "📋 Check the broadcast folder for deployment details"
echo "🔗 View your contracts on Filecoin Calibration Explorer:"
echo "   https://calibration.filscan.io/"
