#!/bin/bash

# Deploy to Base Network (Sepolia Testnet)
set -e

echo "🚀 Deploying dAI-Vault to Base Sepolia Testnet"
echo "=============================================="

# Set private key with 0x prefix
export PRIVATE_KEY="0xe779f495f464a88188164bced8222546ad98fb9877f77fbeb6e0288f05b36cb4"

echo "✅ Private key configured"
echo "🔗 Using RPC: wss://base-sepolia.drpc.org"
echo "📝 Network: Base Sepolia Testnet (Chain ID: 84532)"
echo ""

# Deploy to Base Sepolia Testnet
echo "🔧 Deploying contracts to Base Sepolia..."

forge script script/DeployBase.s.sol:DeployBase \
    --rpc-url wss://base-sepolia.drpc.org \
    --broadcast

echo ""
echo "✅ Deployment completed!"
echo "📋 Check the broadcast folder for deployment details"
echo "🔗 View your contracts on Base Sepolia Explorer:"
echo "   https://sepolia.basescan.org/"
echo ""
echo "📝 Contract addresses saved to deployment summary"
