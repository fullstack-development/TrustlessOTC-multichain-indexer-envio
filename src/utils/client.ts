import { arbitrum, mainnet } from 'viem/chains';
import { createPublicClient, http } from 'viem';

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || 'https://eth.drpc.org';
const ARBITRUM_RPC_URL =
  process.env.ARBITRUM_RPC_URL || 'https://arbitrum.drpc.org';

export const getClient = (chainId: number) => {
  if (chainId === arbitrum.id) {
    return createPublicClient({
      chain: arbitrum,
      transport: http(ARBITRUM_RPC_URL),
      batch: { multicall: true },
    });
  }

  return createPublicClient({
    chain: mainnet,
    transport: http(MAINNET_RPC_URL),
    batch: { multicall: true },
  });
};
