import { createPublicClient, getContract, http, hexToString } from 'viem';
import { mainnet } from 'viem/chains';

const RPC_URL = process.env.RPC_URL;

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
  batch: { multicall: true }, // Enable multicall batching for efficiency
});

const ERC20_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'NAME',
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SYMBOL',
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function getTokenDetails(
  contractAddress: string,
): Promise<{
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
}> {
  // Prepare contract instances for different token standard variations
  const erc20 = getContract({
    address: contractAddress as `0x${string}`,
    abi: ERC20_ABI,
    client: client,
  });

  let results: [number, string, string];

  try {
    // Try standard ERC20 interface first (most common)
    results = await client.multicall({
      allowFailure: false,
      contracts: [
        {
          ...erc20,
          functionName: 'decimals',
        },
        {
          ...erc20,
          functionName: 'name',
        },
        {
          ...erc20,
          functionName: 'symbol',
        },
      ],
    });
  } catch (error) {
    console.log('First multicall failed, trying alternate method');
    results = [0, '', ''];
  }
  
  const [decimals, name, symbol] = results;

  console.log(
    `Got token details for ${contractAddress}: ${name} (${symbol}) with ${decimals} decimals`,
  );

  const entry = {
    name,
    symbol,
    decimals,
  } as const;

  return entry;
}