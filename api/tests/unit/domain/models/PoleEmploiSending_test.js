const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | PoleEmploiSending', () => {
  let expectedPoleEmploiSending;

  describe('buildForParticipationStarted', () => {
    beforeEach(() => {
      expectedPoleEmploiSending = domainBuilder.buildPoleEmploiSending({ type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START, payload: {} });
    });

    it('should build a PoleEmploiSending', () => {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({});

      // then
      expect(poleEmploiSending).to.be.instanceOf(PoleEmploiSending);
    });

    it('should build PoleEmploiSending with type CAMPAIGN_PARTICIPATION_START and given arguments', () => {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
        campaignParticipationId: expectedPoleEmploiSending.campaignParticipationId,
        payload: {},
        isSuccessful: expectedPoleEmploiSending.isSuccessful,
        responseCode: expectedPoleEmploiSending.responseCode,
      });

      // then
      expect(poleEmploiSending).to.deep.equal(expectedPoleEmploiSending);
    });
  });

  describe('buildForParticipationFinished', () => {
    beforeEach(() => {
      expectedPoleEmploiSending = domainBuilder.buildPoleEmploiSending({ type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION, payload: {} });
    });

    it('should build a PoleEmploiSending', () => {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({});

      // then
      expect(poleEmploiSending).to.be.instanceOf(PoleEmploiSending);
    });

    it('should build PoleEmploiSending with type CAMPAIGN_PARTICIPATION_COMPLETION and given arguments', () => {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
        campaignParticipationId: expectedPoleEmploiSending.campaignParticipationId,
        payload: {},
        isSuccessful: expectedPoleEmploiSending.isSuccessful,
        responseCode: expectedPoleEmploiSending.responseCode,
      });

      // then
      expect(poleEmploiSending).to.deep.equal(expectedPoleEmploiSending);
    });
  });

  describe('buildForParticipationShared', () => {
    beforeEach(() => {
      expectedPoleEmploiSending = domainBuilder.buildPoleEmploiSending({ type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING, payload: {} });
    });

    it('should build a PoleEmploiSending', () => {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({});

      // then
      expect(poleEmploiSending).to.be.instanceOf(PoleEmploiSending);
    });

    it('should build PoleEmploiSending with type CAMPAIGN_PARTICIPATION_SHARING and given arguments', () => {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
        campaignParticipationId: expectedPoleEmploiSending.campaignParticipationId,
        payload: {},
        isSuccessful: expectedPoleEmploiSending.isSuccessful,
        responseCode: expectedPoleEmploiSending.responseCode,
      });

      // then
      expect(poleEmploiSending).to.deep.equal(expectedPoleEmploiSending);
    });
  });
});
