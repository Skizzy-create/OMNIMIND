import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "@ethersproject/contracts";
import ky from "ky";

const CRYPTO_ORACLE_ABI = [
  "function updateCryptoData(string symbol, uint256 price, uint256 marketCap, uint256 volume24h, uint256 timestamp)",
  "function lastUpdated(string symbol) external view returns(uint256)",
  "function getCryptoData(string symbol) external view returns(uint256, uint256, uint256, uint256)",
];

// zkTLS proof structure interface
interface zkTLSProof {
  proof: string;
  publicInputs: string[];
  metadata: {
    timestamp: number;
    source: string;
    hash: string;
  };
}

// Crypto data interface
interface CryptoData {
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  lastUpdated: string;
}

// Data validation function
function validateCryptoData(data: any): boolean {
  const requiredFields = ['price', 'market_cap', 'volume_24h'];
  
  for (const field of requiredFields) {
    if (!data.quote?.USD?.[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
    
    if (typeof data.quote.USD[field] !== 'number') {
      console.error(`Invalid data type for ${field}`);
      return false;
    }
    
    if (data.quote.USD[field] < 0) {
      console.error(`Negative value for ${field}`);
      return false;
    }
  }
  
  return true;
}

// Generate zkTLS proof (simplified implementation)
async function generateZkTLSProof(data: CryptoData, apiResponse: string): Promise<zkTLSProof> {
  // In production, integrate with Reclaim Protocol SDK
  const proof = {
    proof: `zktls_proof_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    publicInputs: [
      data.price.toString(),
      data.marketCap.toString(),
      data.volume24h.toString(),
    ],
    metadata: {
      timestamp: Date.now(),
      source: "coinmarketcap.com",
      hash: Buffer.from(apiResponse).toString('base64').substring(0, 32),
    }
  };
  
  console.log("Generated zkTLS proof:", proof.proof);
  return proof;
}

// Main Web3 Function
Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, secrets, storage, multiChainProvider } = context;

  // Configuration
  const cryptoSymbols = (userArgs.cryptoSymbols as string[]) || ["bitcoin", "ethereum", "cardano"];
  const updateInterval = parseInt(userArgs.updateInterval as string) || 600; // 10 minutes default
  const oracleAddress = (userArgs.oracleAddress as string) || "0x71B9B0F6C999CBbB0FeF9c92B80D54e4973214da";

  const provider = multiChainProvider.default();
  const oracle = new Contract(oracleAddress, CRYPTO_ORACLE_ABI, provider);

  try {
    // Get API key from secrets
    const apiKey = await secrets.get("COINMARKETCAP_API_KEY");
    if (!apiKey) {
      return { canExec: false, message: "API key not found in secrets" };
    }

    const callData = [];
    const zkProofs: zkTLSProof[] = [];

    for (const symbol of cryptoSymbols) {
      console.log(`Processing ${symbol}...`);

      // Check if update is needed
      const lastUpdated = parseInt(await oracle.lastUpdated(symbol));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime < lastUpdated + updateInterval) {
        console.log(`${symbol} update not needed yet`);
        continue;
      }

      // Fetch data from CoinMarketCap API
      const apiUrl = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
      const response = await ky.get(apiUrl, {
        searchParams: {
          slug: symbol,
          convert: "USD"
        },
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
          "Accept": "application/json"
        },
        timeout: 10000,
        retry: 2
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.status.error_code !== 0) {
        console.error(`API error for ${symbol}:`, data.status.error_message);
        continue;
      }

      // Get the first (and usually only) entry from the data object
      const cryptoId = Object.keys(data.data)[0];
      const cryptoInfo = data.data[cryptoId];

      // Validate data
      if (!validateCryptoData(cryptoInfo)) {
        console.error(`Invalid data for ${symbol}`);
        continue;
      }

      // Extract crypto data
      const cryptoData: CryptoData = {
        symbol: cryptoInfo.symbol,
        price: Math.floor(cryptoInfo.quote.USD.price * 1e8), // Convert to 8 decimals for blockchain
        marketCap: Math.floor(cryptoInfo.quote.USD.market_cap),
        volume24h: Math.floor(cryptoInfo.quote.USD.volume_24h),
        percentChange24h: cryptoInfo.quote.USD.percent_change_24h,
        lastUpdated: cryptoInfo.last_updated
      };

      console.log(`${symbol} data:`, {
        price: cryptoData.price / 1e8, // Show actual price for logging
        marketCap: cryptoData.marketCap,
        volume24h: cryptoData.volume24h
      });

      // Generate zkTLS proof
      const zkProof = await generateZkTLSProof(cryptoData, responseText);
      zkProofs.push(zkProof);

      // Store proof in storage for later verification
      await storage.set(`zkproof_${symbol}_${currentTime}`, JSON.stringify(zkProof));

      // Prepare transaction data
      const updateData = oracle.interface.encodeFunctionData("updateCryptoData", [
        cryptoData.symbol,
        cryptoData.price,
        cryptoData.marketCap,
        cryptoData.volume24h,
        currentTime
      ]);

      callData.push({
        to: oracleAddress,
        data: updateData
      });
    }

    if (callData.length === 0) {
      return { canExec: false, message: "No updates needed" };
    }

    console.log(`Updating ${callData.length} crypto assets with zkTLS proofs`);

    return {
      canExec: true,
      callData: callData
    };

  } catch (error) {
    console.error("Error in Web3 Function:", error);
    return {
      canExec: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
});
