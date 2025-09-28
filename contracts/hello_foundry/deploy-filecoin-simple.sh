#!/bin/bash

# Simple deployment to Filecoin Calibration Testnet
set -e

echo "🚀 Deploying dAI-Vault to Filecoin Calibration Testnet (Simple)"
echo "==============================================================="

# Set private key with 0x prefix
export PRIVATE_KEY="0x41c80d358529c1ecddb851ef91cc44739bf7cac3f2910147e791f815b623312c"

echo "✅ Private key configured"
echo "🔗 Using RPC: https://rpc.ankr.com/filecoin_testnet"
echo ""

# Deploy without explicit gas settings - let Forge estimate
echo "🔧 Deploying contracts with automatic gas estimation..."

forge script script/DeployFilecoinCalibration.s.sol:DeployFilecoinCalibration \
    --rpc-url https://rpc.ankr.com/filecoin_testnet \
    --broadcast \
    --legacy

echo ""
echo "✅ Deployment completed!"
echo "📋 Check the broadcast folder for deployment details"
echo "🔗 View your contracts on Filecoin Calibration Explorer:"
echo "   https://calibration.filscan.io/"