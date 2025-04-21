import { TrustlessOTC, TradeOffer, BigDecimal, Token } from 'generated';
import { ADDRESS_ZERO, ZERO_BI, ZERO_BD } from './utils/constants';
import { getTokenDetails } from './utils/tokenDetails';
import { fetchOffer, fetchOfferDetails } from './utils/offerDetails';

TrustlessOTC.OfferCreated.handler(async ({ event, context }) => {
  const tradeId = event.params.tradeID.toString();

  const offer = await fetchOffer(event.srcAddress, BigInt(tradeId));
  const offerDetails = await fetchOfferDetails(
    event.srcAddress,
    BigInt(tradeId),
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
    const tokenFromDetails = await getTokenDetails(offer.tokenFrom);

    tokenFrom = {
      id: offer.tokenFrom,
      name: tokenFromDetails.name,
      symbol: tokenFromDetails.symbol,
      decimals: BigInt(tokenFromDetails.decimals),
    };

    context.Token.set(tokenFrom);
  }

  if (!tokenTo) {
    const tokenToDetails = await getTokenDetails(offer.tokenTo);

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
