import {
  createPublicClient,
  getContract,
  http,
  parseEventLogs,
  parseAbiItem,
} from 'viem';
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

// Some precompile contracts return a value,
// so the subgraph does not recognize the error when the function is called
let PRECOMPILES: string[] = [
  '0x0000000000000000000000000000000000000002', // sha256
  '0x0000000000000000000000000000000000000003', // ripemd
  '0x0000000000000000000000000000000000000004', // identity
  '0x0000000000000000000000000000000000000005',
  '0x0000000000000000000000000000000000000006',
  '0x0000000000000000000000000000000000000009',
  '0x000000000000000000000000000000000000000a',
];

function isPrecompiles(contractAddress: string): boolean {
  for (let i = 0; i < PRECOMPILES.length; ++i) {
    if (contractAddress == PRECOMPILES[i]) {
      return true;
    }
  }
  return false;
}

export async function getTokenDetails(contractAddress: string): Promise<{
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

  if (isPrecompiles(contractAddress)) {
    return {
      name: 'UNKNOWN',
      symbol: 'UNKNOWN',
      decimals: 0,
    };
  }

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

export async function getTransferEventsFromTx(txHash: `0x${string}`): Promise<
  {
    from: string;
    to: string;
    value: bigint;
    contractAddress: `0x${string}`;
  }[]
> {
  const receipt = await client.getTransactionReceipt({ hash: txHash });

  const parsed = parseEventLogs({
    abi: [
      parseAbiItem(
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ),
    ],
    logs: receipt.logs,
  });

  const transfers = parsed
    .filter((log) => log.eventName === 'Transfer')
    .map((log) => ({
      from: log.args.from,
      to: log.args.to,
      value: log.args.value,
      contractAddress: log.address,
    }));

  return transfers;
}
