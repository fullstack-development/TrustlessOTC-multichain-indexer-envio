import { arbitrum, mainnet } from 'viem/chains';
import { createPublicClient, http } from 'viem';

const RPC_URL = process.env.RPC_URL;
const RPC_URL_ARBITRUM = process.env.RPC_URL_ARBITRUM;

export const getClient = (chainId: number) => {
  if (chainId === arbitrum.id) {
    return createPublicClient({
      chain: arbitrum,
      transport: http(RPC_URL_ARBITRUM),
      batch: { multicall: true },
    });
  }

  return createPublicClient({
    chain: mainnet,
    transport: http(RPC_URL),
    batch: { multicall: true },
  });
};
