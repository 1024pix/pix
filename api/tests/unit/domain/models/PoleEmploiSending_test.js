import PoleEmploiSending from '../../../../lib/domain/models/PoleEmploiSending';
import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | Domain | Models | PoleEmploiSending', function () {
  let expectedPoleEmploiSending;

  describe('buildForParticipationStarted', function () {
    beforeEach(function () {
      expectedPoleEmploiSending = domainBuilder.buildPoleEmploiSending({
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
        payload: {},
      });
    });

    it('should build a PoleEmploiSending', function () {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({});

      // then
      expect(poleEmploiSending).to.be.instanceOf(PoleEmploiSending);
    });

    it('should build PoleEmploiSending with type CAMPAIGN_PARTICIPATION_START and given arguments', function () {
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

  describe('buildForParticipationFinished', function () {
    beforeEach(function () {
      expectedPoleEmploiSending = domainBuilder.buildPoleEmploiSending({
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
        payload: {},
      });
    });

    it('should build a PoleEmploiSending', function () {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({});

      // then
      expect(poleEmploiSending).to.be.instanceOf(PoleEmploiSending);
    });

    it('should build PoleEmploiSending with type CAMPAIGN_PARTICIPATION_COMPLETION and given arguments', function () {
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

  describe('buildForParticipationShared', function () {
    beforeEach(function () {
      expectedPoleEmploiSending = domainBuilder.buildPoleEmploiSending({
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
        payload: {},
      });
    });

    it('should build a PoleEmploiSending', function () {
      // when
      const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({});

      // then
      expect(poleEmploiSending).to.be.instanceOf(PoleEmploiSending);
    });

    it('should build PoleEmploiSending with type CAMPAIGN_PARTICIPATION_SHARING and given arguments', function () {
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
