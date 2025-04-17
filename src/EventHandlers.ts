/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  TrustlessOTC,
  TrustlessOTC_OfferCancelled,
  TrustlessOTC_OfferCreated,
  TrustlessOTC_OfferTaken,
} from "generated";

TrustlessOTC.OfferCancelled.handler(async ({ event, context }) => {
  const entity: TrustlessOTC_OfferCancelled = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tradeID: event.params.tradeID,
  };

  context.TrustlessOTC_OfferCancelled.set(entity);
});

TrustlessOTC.OfferCreated.handler(async ({ event, context }) => {
  const entity: TrustlessOTC_OfferCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tradeID: event.params.tradeID,
  };

  context.TrustlessOTC_OfferCreated.set(entity);
});

TrustlessOTC.OfferTaken.handler(async ({ event, context }) => {
  const entity: TrustlessOTC_OfferTaken = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tradeID: event.params.tradeID,
  };

  context.TrustlessOTC_OfferTaken.set(entity);
});
