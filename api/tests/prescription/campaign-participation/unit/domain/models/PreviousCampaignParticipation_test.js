import { expect } from 'chai';

import { PreviousCampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/PreviousCampaignParticipation.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';

describe('Unit | Domain | Read-Models | PreviousCampaignParticipation', function () {
  describe('#constructor', function () {
    it('should build a PreviousCampaignParticipant readmodel object from data', function () {
      // given
      const id = 1;
      const participantExternalId = 1;
      const validatedSkillsCount = 1;
      const status = CampaignParticipationStatuses.SHARED;
      const isDeleted = true;
      const isTargetProfileResetAllowed = true;
      const isOrganizationLearnerActive = true;
      const isCampaignMultipleSendings = false;
      const params = {
        id,
        participantExternalId,
        validatedSkillsCount,
        status,
        isDeleted,
        isTargetProfileResetAllowed,
        isOrganizationLearnerActive,
        isCampaignMultipleSendings,
      };

      // when
      const result = new PreviousCampaignParticipation({ ...params });

      expect(result).to.be.instanceOf(PreviousCampaignParticipation);
      expect(result).to.be.deep.equal({ ...params });
    });
  });

  describe('#canReset', function () {
    let baseProps;

    beforeEach(function () {
      baseProps = {
        id: 1,
        participantExternalId: 1,
        validatedSkillsCount: 1,
        status: CampaignParticipationStatuses.SHARED,
        isDeleted: true,
        isTargetProfileResetAllowed: true,
        isCampaignMultipleSendings: true,
        isResetAllowed: true,
        isOrganizationLearnerActive: true,
      };
    });

    describe('when isTargetProfileResetAllowed is true', function () {
      it('should return true', function () {
        // given
        const isTargetProfileResetAllowed = true;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isTargetProfileResetAllowed,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.true;
      });
    });

    describe('when isTargetProfileResetAllowed is false', function () {
      it('should return false', function () {
        // given
        const isTargetProfileResetAllowed = false;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isTargetProfileResetAllowed,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.false;
      });
    });

    describe('isResetAllowed', function () {
      it('should return true when isResetAllowed is true', function () {
        // given
        const isResetAllowed = true;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isResetAllowed,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.true;
      });

      it('should return false when isResetAllowed is false', function () {
        // given
        const isResetAllowed = true;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isResetAllowed,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.true;
      });
    });

    describe('when isCampaignMultipleSendings is true', function () {
      it('should return true', function () {
        // given
        const isCampaignMultipleSendings = true;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isCampaignMultipleSendings,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.true;
      });
    });

    describe('when isCampaignMultipleSendings is false', function () {
      it('should return false', function () {
        // given
        const isCampaignMultipleSendings = false;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isCampaignMultipleSendings,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.false;
      });
    });

    describe('when isOrganizationLearnerActive is true', function () {
      it('should return true', function () {
        // given
        const isOrganizationLearnerActive = true;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isOrganizationLearnerActive,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.true;
      });
    });

    describe('when isOrganizationLearnerActive is false', function () {
      it('should return false', function () {
        // given
        const isOrganizationLearnerActive = false;
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          isOrganizationLearnerActive,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.false;
      });
    });
  });
});
