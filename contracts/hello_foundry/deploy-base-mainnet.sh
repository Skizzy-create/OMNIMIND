#!/bin/bash

# Deploy to Base Network (Mainnet)
set -e

echo "🚀 Deploying dAI-Vault to Base Mainnet"
echo "======================================"

# Set private key with 0x prefix
export PRIVATE_KEY="0x41c80d358529c1ecddb851ef91cc44739bf7cac3f2910147e791f815b623312c"

echo "✅ Private key configured"
echo "🔗 Using RPC: https://mainnet.base.org"
echo "📝 Network: Base Mainnet (Chain ID: 8453)"
echo "⚠️  WARNING: This will deploy to MAINNET with real ETH!"
echo ""

# Confirm deployment
read -p "Are you sure you want to deploy to Base Mainnet? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy to Base Mainnet
echo "🔧 Deploying contracts to Base Mainnet..."

forge script script/DeployBase.s.sol:DeployBase \
    --rpc-url https://mainnet.base.org \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    --verifier-url https://api.basescan.org/api

echo ""
echo "✅ Deployment completed!"
echo "📋 Check the broadcast folder for deployment details"
echo "🔗 View your contracts on Base Explorer:"
echo "   https://basescan.org/"
echo ""
echo "📝 Contract addresses saved to deployment summary"
