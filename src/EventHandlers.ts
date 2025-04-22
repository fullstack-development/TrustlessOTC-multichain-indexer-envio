import { TrustlessOTC, TradeOffer, BigDecimal, Token } from 'generated';
import { ADDRESS_ZERO, ZERO_BI } from './utils/constants';
import { getTokenDetails, getTransferEventsFromTx } from './utils/tokenDetails';
import {
  fetchOffer,
  fetchOfferDetails,
  fetchUserTradesAndValidateTaker,
} from './utils/offerDetails';

TrustlessOTC.OfferCreated.handler(async ({ event, context }) => {
  const tradeId = `${event.chainId}_${event.params.tradeID}`;

  const offer = await fetchOffer(
    event.srcAddress,
    BigInt(event.params.tradeID),
    Number(event.chainId),
  );
  const offerDetails = await fetchOfferDetails(
    event.srcAddress,
    BigInt(event.params.tradeID),
    Number(event.chainId),
  );

  const tradeOffer: TradeOffer = {
    id: tradeId,
    tokenFrom_id: offer.tokenFrom,
    tokenTo_id: offer.tokenTo,
    amountFrom: BigDecimal(offer.amountFrom.toString()),
    amountFromWithFee: BigDecimal(
      (offer.amountFrom - offerDetails.fee).toString(),
    ),
    amountTo: BigDecimal(offer.amountTo.toString()),
    txFrom: event.transaction.from ?? ADDRESS_ZERO,
    creator: offer.creator,
    taker: ADDRESS_ZERO,
    optionalTaker: offer.optionalTaker,
    active: true,
    completed: false,
    tradeID: event.params.tradeID,
    feeAmount: offerDetails.fee,
    blockNumber: BigInt(event.block.number),
    creationTimestamp: BigInt(event.block.timestamp),
    cancelTimestamp: ZERO_BI,
    takenTimestamp: ZERO_BI,
    creationHash: event.transaction.hash,
    cancelHash: undefined,
    takenHash: undefined,
  };

  let tokenFrom: Token | undefined = await context.Token.get(offer.tokenFrom);
  let tokenTo: Token | undefined = await context.Token.get(offer.tokenTo);

  if (!tokenFrom) {
    const tokenFromDetails = await getTokenDetails(
      offer.tokenFrom,
      Number(event.chainId),
    );

    tokenFrom = {
      id: offer.tokenFrom,
      name: tokenFromDetails.name,
      symbol: tokenFromDetails.symbol,
      decimals: BigInt(tokenFromDetails.decimals),
    };

    context.Token.set(tokenFrom);
  }

  if (!tokenTo) {
    const tokenToDetails = await getTokenDetails(
      offer.tokenTo,
      Number(event.chainId),
    );

    tokenTo = {
      id: offer.tokenTo,
      name: tokenToDetails.name,
      symbol: tokenToDetails.symbol,
      decimals: BigInt(tokenToDetails.decimals),
    };

    context.Token.set(tokenTo);
  }

  context.TradeOffer.set(tradeOffer);
});

TrustlessOTC.OfferCancelled.handlerWithLoader({
  // The loader function runs before event processing starts
  loader: async ({ event, context }) => {
    const tradeOffer: TradeOffer | undefined = await context.TradeOffer.get(
      `${event.chainId}_${event.params.tradeID}`,
    );

    return {
      tradeOffer,
    };
  },

  // The handler function processes each event with pre-loaded data
  handler: async ({ event, context, loaderReturn }) => {
    // Process the event using the data returned by the loader
    const { tradeOffer } = loaderReturn;

    if (tradeOffer) {
      const existingTradeOffer: TradeOffer = {
        ...tradeOffer,
        active: false,
        cancelTimestamp: BigInt(event.block.timestamp),
        cancelHash: event.transaction.hash,
      };

      context.TradeOffer.set(existingTradeOffer);
    }
  },
});

TrustlessOTC.OfferTaken.handlerWithLoader({
  loader: async ({ event, context }) => {
    const tradeOffer: TradeOffer | undefined = await context.TradeOffer.get(
      `${event.chainId}_${event.params.tradeID}`,
    );

    return {
      tradeOffer,
    };
  },

  handler: async ({ event, context, loaderReturn }) => {
    const { tradeOffer } = loaderReturn;

    if (tradeOffer) {
      const transfers = await getTransferEventsFromTx(
        event.transaction.hash as `0x${string}`,
        Number(event.chainId),
      );

      let taker = ADDRESS_ZERO;

      for (let i = 0; i < transfers.length; i++) {
        const transfer = transfers[i];

        if (
          tradeOffer.creator === transfer.to &&
          transfer.from !== event.srcAddress
        ) {
          const isTaker = await fetchUserTradesAndValidateTaker(
            event.srcAddress,
            transfer.from,
            event.params.tradeID,
            Number(event.chainId),
          );

          taker = isTaker ? transfer.from : taker;
        }
      }

      const existingTradeOffer: TradeOffer = {
        ...tradeOffer,
        active: false,
        completed: true,
        taker: taker as string,
        takenTimestamp: BigInt(event.block.timestamp),
        takenHash: event.transaction.hash,
      };

      context.TradeOffer.set(existingTradeOffer);
    }
  },
});
