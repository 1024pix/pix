import { expect, sinon } from '../../../test-helper.js';
import { PreviousCampaignParticipation } from '../../../../lib/domain/read-models/PreviousCampaignParticipation.js';
import { constants } from '../../../../lib/domain/constants.js';

describe('Unit | Domain | Read-Models | PreviousCampaignParticipation', function () {
  describe('#constructor', function () {
    it('should build a PreviousCampaignParticipant readmodel object from data', function () {
      // given
      const id = 1;
      const participantExternalId = 1;
      const validatedSkillsCount = 1;
      const status = 'ENDED';
      const isDeleted = true;
      const isTargetProfileResetAllowed = true;
      const isOrganizationLearnerActive = true;
      const isCampaignMultipleSendings = false;
      const sharedAt = new Date('2019-03-12T01:02:03Z');
      const params = {
        id,
        participantExternalId,
        validatedSkillsCount,
        status,
        isDeleted,
        isTargetProfileResetAllowed,
        isOrganizationLearnerActive,
        isCampaignMultipleSendings,
        sharedAt,
      };

      // when
      const result = new PreviousCampaignParticipation({ ...params });

      expect(result).to.be.instanceOf(PreviousCampaignParticipation);
      expect(result).to.be.deep.equal({ ...params });
    });
  });

  describe('#canReset', function () {
    let clock, originalConstantValue, now, baseProps;

    beforeEach(function () {
      originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
      now = new Date('2020-01-07T05:06:07Z');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      sinon.stub(constants, 'MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING').value(4);

      baseProps = {
        id: 1,
        participantExternalId: 1,
        validatedSkillsCount: 1,
        status: 'ENDED',
        isDeleted: true,
        isTargetProfileResetAllowed: true,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        sharedAt: new Date('2020-01-01T01:02:03Z'),
      };
    });

    afterEach(function () {
      clock.restore();
      sinon.stub(constants, 'MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING').value(originalConstantValue);
    });

    describe('when isShared is not defined', function () {
      it('should return false', function () {
        // given
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          sharedAt: undefined,
        });
        // when & then
        expect(previousCampaignParticipation.canReset).to.be.false;
      });
    });

    describe('when previous campaign participation does not respect minimum delay', function () {
      it('should return false', function () {
        // given
        const sharedAt = new Date('2020-01-04T01:02:03Z');
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          sharedAt,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.false;
      });
    });

    describe('when previous campaign participation has exact minimum delay', function () {
      it('should return true', function () {
        // given
        const sharedAt = new Date('2020-01-03T01:02:03Z');
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          sharedAt,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.true;
      });
    });

    describe('when previous campaign participation respects minimum delay', function () {
      it('should return true', function () {
        // given
        const sharedAt = new Date('2020-01-01T01:02:03Z');
        const previousCampaignParticipation = new PreviousCampaignParticipation({
          ...baseProps,
          sharedAt,
        });

        // when & then
        expect(previousCampaignParticipation.canReset).to.be.true;
      });
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
