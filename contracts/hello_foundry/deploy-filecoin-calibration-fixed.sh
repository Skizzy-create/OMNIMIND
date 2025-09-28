#!/bin/bash

# Deploy to Filecoin Calibration Testnet with Fixed Gas Settings
# This script addresses the gas limit issues encountered on Filecoin

set -e

echo "🚀 Deploying dAI-Vault to Filecoin Calibration Testnet with Fixed Gas Settings"
echo "=================================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your PRIVATE_KEY"
    exit 1
fi

# Load environment variables
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not found in .env file!"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📝 Using gas limit: 50,000,000 (50M gas)"
echo "📝 Using gas price: 2,000,000,000 (2 gwei)"
echo ""

# Deploy with explicit gas settings
echo "🔧 Deploying contracts with Filecoin-optimized gas settings..."

forge script script/DeployFilecoinCalibration.s.sol:DeployFilecoinCalibration \
    --rpc-url https://api.calibration.node.glif.io/rpc/v1 \
    --broadcast \
    --verify \
    --verifier-url https://api.calibration.node.glif.io/rpc/v1 \
    --verifier etherscan \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --gas-limit 50000000 \
    --gas-price 2000000000 \
    --legacy

echo ""
echo "✅ Deployment completed!"
echo "📋 Check the broadcast folder for deployment details"
echo "🔗 View your contracts on Filecoin Calibration Explorer:"
echo "   https://calibration.filscan.io/"
