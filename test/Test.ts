import assert from "assert";
import { 
  TestHelpers,
  TrustlessOTC_OfferCancelled
} from "generated";
const { MockDb, TrustlessOTC } = TestHelpers;

describe("TrustlessOTC contract OfferCancelled event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for TrustlessOTC contract OfferCancelled event
  const event = TrustlessOTC.OfferCancelled.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("TrustlessOTC_OfferCancelled is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await TrustlessOTC.OfferCancelled.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualTrustlessOTCOfferCancelled = mockDbUpdated.entities.TrustlessOTC_OfferCancelled.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedTrustlessOTCOfferCancelled: TrustlessOTC_OfferCancelled = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      tradeID: event.params.tradeID,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualTrustlessOTCOfferCancelled, expectedTrustlessOTCOfferCancelled, "Actual TrustlessOTCOfferCancelled should be the same as the expectedTrustlessOTCOfferCancelled");
  });
});
