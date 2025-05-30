import { getContract } from 'viem';
import { getClient } from './client';

const TRUSTLESS_OTC_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_feeBasisPoints',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tradeID',
        type: 'uint256',
      },
    ],
    name: 'OfferCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tradeID',
        type: 'uint256',
      },
    ],
    name: 'OfferCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tradeID',
        type: 'uint256',
      },
    ],
    name: 'OfferTaken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'balanceTracker',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'tradeID', type: 'uint256' }],
    name: 'cancelTrade',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'contract IERC20', name: '_token', type: 'address' },
    ],
    name: 'claimFees',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'feeBasisPoints',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'feeTracker',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'uint256', name: 'tradeID', type: 'uint256' }],
    name: 'getOfferDetails',
    outputs: [
      { internalType: 'address', name: '_tokenFrom', type: 'address' },
      { internalType: 'address', name: '_tokenTo', type: 'address' },
      { internalType: 'uint256', name: '_amountFrom', type: 'uint256' },
      { internalType: 'uint256', name: '_amountTo', type: 'uint256' },
      { internalType: 'address', name: '_creator', type: 'address' },
      { internalType: 'uint256', name: '_fee', type: 'uint256' },
      { internalType: 'bool', name: '_active', type: 'bool' },
      { internalType: 'bool', name: '_completed', type: 'bool' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserTrades',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: '_tokenFrom', type: 'address' },
      { internalType: 'address', name: '_tokenTo', type: 'address' },
      { internalType: 'uint256', name: '_amountFrom', type: 'uint256' },
      { internalType: 'uint256', name: '_amountTo', type: 'uint256' },
      { internalType: 'address', name: '_optionalTaker', type: 'address' },
    ],
    name: 'initiateTrade',
    outputs: [{ internalType: 'uint256', name: 'newTradeID', type: 'uint256' }],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'isOwner',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'offers',
    outputs: [
      { internalType: 'address', name: 'tokenFrom', type: 'address' },
      { internalType: 'address', name: 'tokenTo', type: 'address' },
      { internalType: 'uint256', name: 'amountFrom', type: 'uint256' },
      { internalType: 'uint256', name: 'amountTo', type: 'uint256' },
      {
        internalType: 'address payable',
        name: 'creator',
        type: 'address',
      },
      { internalType: 'address', name: 'optionalTaker', type: 'address' },
      { internalType: 'bool', name: 'active', type: 'bool' },
      { internalType: 'bool', name: 'completed', type: 'bool' },
      { internalType: 'uint256', name: 'tradeID', type: 'uint256' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'contract IERC20', name: '_token', type: 'address' },
    ],
    name: 'reclaimToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'tradeID', type: 'uint256' }],
    name: 'take',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'tradeTracker',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function fetchOffer(
  contractAddress: string,
  tradeID: bigint,
  chainID: number
): Promise<{
  tokenFrom: string;
  tokenTo: string;
  amountFrom: bigint;
  amountTo: bigint;
  creator: string;
  optionalTaker: string;
  active: boolean;
  completed: boolean;
  tradeID: bigint;
}> {
  const client = getClient(chainID);

  try {
    const result = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: TRUSTLESS_OTC_ABI,
      functionName: 'offers',
      args: [tradeID],
    });

    return {
      tokenFrom: result[0],
      tokenTo: result[1],
      amountFrom: result[2],
      amountTo: result[3],
      creator: result[4],
      optionalTaker: result[5],
      active: result[6],
      completed: result[7],
      tradeID: result[8],
    };
  } catch (error) {
    console.error('Error fetching offer:', error);
    throw error;
  }
}

export async function fetchOfferDetails(
  contractAddress: string,
  tradeID: bigint,
  chainID: number
): Promise<{
  readonly tokenFrom: string;
  readonly tokenTo: string;
  readonly amountFrom: bigint;
  readonly amountTo: bigint;
  readonly creator: string;
  readonly fee: bigint;
  readonly active: boolean;
  readonly completed: boolean;
}> {
  const client = getClient(chainID);

  const trustlessOTC = getContract({
    address: contractAddress as `0x${string}`,
    abi: TRUSTLESS_OTC_ABI,
    client: client,
  });

  try {
    const result = await trustlessOTC.read.getOfferDetails([tradeID]);

    const [
      tokenFrom,
      tokenTo,
      amountFrom,
      amountTo,
      creator,
      fee,
      active,
      completed,
    ] = result;

    return {
      tokenFrom,
      tokenTo,
      amountFrom,
      amountTo,
      creator,
      fee,
      active,
      completed,
    };
  } catch (error) {
    console.error(
      `Failed to fetch offer details for trade ID ${tradeID}:`,
      error,
    );
    throw error;
  }
}

export async function fetchUserTradesAndValidateTaker(
  contractAddress: string,
  user: string,
  tradeID: bigint,
  chainID: number
): Promise<boolean> {
  const client = getClient(chainID);
  const trustlessOTC = getContract({
    address: contractAddress as `0x${string}`,
    abi: TRUSTLESS_OTC_ABI,
    client: client,
  });

  try {
    const userTrades = await trustlessOTC.read.getUserTrades([
      user as `0x${string}`,
    ]);
    return userTrades.includes(tradeID);
  } catch (error) {
    console.error(
      `Failed to fetch user trades for address ${user} and trade ID ${tradeID}:`,
      error,
    );
    return false;
  }
}
