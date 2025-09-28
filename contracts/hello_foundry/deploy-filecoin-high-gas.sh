#!/bin/bash

# Deploy to Filecoin Calibration with high gas limit
set -e

echo "🚀 Deploying dAI-Vault to Filecoin Calibration Testnet (High Gas)"
echo "================================================================="

# Set private key with 0x prefix
export PRIVATE_KEY="0x41c80d358529c1ecddb851ef91cc44739bf7cac3f2910147e791f815b623312c"

echo "✅ Private key configured"
echo "🔗 Using RPC: https://api.calibration.node.glif.io/rpc/v1"
echo "📝 Using high gas limit: 15,000,000 (15M gas)"
echo ""

# Deploy with high gas limit
echo "🔧 Deploying contracts with high gas limit..."

forge script script/DeployFilecoinCalibration.s.sol:DeployFilecoinCalibration \
    --rpc-url https://api.calibration.node.glif.io/rpc/v1 \
    --broadcast \
    --gas-limit 15000000 \
    --legacy

echo ""
echo "✅ Deployment completed!"
echo "📋 Check the broadcast folder for deployment details"
echo "🔗 View your contracts on Filecoin Calibration Explorer:"
echo "   https://calibration.filscan.io/"
