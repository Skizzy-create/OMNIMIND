#!/bin/bash

# Test Filecoin Testnet Deployment
echo "🧪 Testing Filecoin Testnet Deployment"
echo "====================================="

# Contract addresses
DataRegistry="0xd89fC314223309Eed82EA997b659608438615a50"
DataNFT="0x02B6E36b3D477ccB15da3Bc1335cb104e89199C6"
DataCoin="0x530D7e56E622D9253c1eFA5c96172DA4b116E155"
DummyVerifier="0x1751b8E30951451b3b349cF268b155Bd8fE9328d"
AccessManager="0xad043198cCcC59b746391C00135F3A601679D0B0"

RPC_URL="https://rpc.ankr.com/filecoin_testnet"

echo "📋 Contract Addresses:"
echo "  DataRegistry: $DataRegistry"
echo "  DataNFT: $DataNFT"
echo "  DataCoin: $DataCoin"
echo "  DummyVerifier: $DummyVerifier"
echo "  AccessManager: $AccessManager"
echo ""

echo "🔍 Testing contract interactions..."

# Test DataRegistry dataset count
echo "📊 Testing DataRegistry dataset count..."
DATASET_COUNT=$(cast call $DataRegistry "datasetCount()" --rpc-url $RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ DataRegistry dataset count: $DATASET_COUNT"
else
    echo "❌ Failed to call DataRegistry"
fi

# Test DataCoin total supply
echo "💰 Testing DataCoin total supply..."
TOTAL_SUPPLY=$(cast call $DataCoin "totalSupply()" --rpc-url $RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ DataCoin total supply: $TOTAL_SUPPLY"
else
    echo "❌ Failed to call DataCoin"
fi

# Test DataNFT token counter
echo "🎨 Testing DataNFT token counter..."
TOKEN_COUNTER=$(cast call $DataNFT "tokenCounter()" --rpc-url $RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ DataNFT token counter: $TOKEN_COUNTER"
else
    echo "❌ Failed to call DataNFT"
fi

echo ""
echo "🎉 Deployment test completed!"
echo "📄 Check the results above to verify contract functionality"
