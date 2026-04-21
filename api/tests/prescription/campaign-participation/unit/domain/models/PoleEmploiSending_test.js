import { PoleEmploiSending } from '../../../../../../src/prescription/campaign-participation/domain/models/PoleEmploiSending.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | PoleEmploiSending', function () {
  let expectedPoleEmploiSending;

  describe('buildForParticipationStarted', function () {
    beforeEach(function () {
      expectedPoleEmploiSending = domainBuilder.buildPoleEmploiSending({
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
        payload: {},
        responseCode: '20',
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
        responseCode: '20',
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
        responseCode: '18',
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
        responseCode: '18',
      });

      // then
      expect(poleEmploiSending).to.deep.equal(expectedPoleEmploiSending);
    });
  });
});
