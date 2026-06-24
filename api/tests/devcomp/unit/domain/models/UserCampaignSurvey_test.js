import { UserCampaignSurvey } from '../../../../../src/devcomp/domain/models/UserCampaignSurvey.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | UserCampaignSurvey', function () {
  describe('#constructor', function () {
    it('should create a UserCampaignSurvey with valid attributes', function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const satisfactionScore = 3;

      // when
      const survey = new UserCampaignSurvey({ userId, campaignId, satisfactionScore });

      // then
      expect(survey.userId).to.equal(userId);
      expect(survey.campaignId).to.equal(campaignId);
      expect(survey.satisfactionScore).to.equal(satisfactionScore);
    });

    describe('if userId is missing', function () {
      it('should throw a DomainError', function () {
        // when
        const error = catchErrSync(() => new UserCampaignSurvey({ campaignId: 1, satisfactionScore: 3 }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The userId is required for a UserCampaignSurvey');
      });
    });

    describe('if campaignId is missing', function () {
      it('should throw a DomainError', function () {
        // when
        const error = catchErrSync(() => new UserCampaignSurvey({ userId: 1, satisfactionScore: 3 }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The campaignId is required for a UserCampaignSurvey');
      });
    });

    describe('if satisfactionScore is missing', function () {
      it('should throw a DomainError', function () {
        // when
        const error = catchErrSync(() => new UserCampaignSurvey({ userId: 1, campaignId: 2 }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The satisfactionScore is required for a UserCampaignSurvey');
      });
    });

    describe('if satisfactionScore is out of range', function () {
      [0, 6, -1, 100].forEach((satisfactionScore) => {
        it(`should throw a DomainError for satisfactionScore ${satisfactionScore}`, function () {
          // when
          const error = catchErrSync(() => new UserCampaignSurvey({ userId: 1, campaignId: 2, satisfactionScore }))();

          // then
          expect(error).to.be.instanceOf(DomainError);
          expect(error.message).to.equal('The satisfactionScore must be an integer between 1 and 5');
        });
      });

      it('should throw a DomainError for a non-integer score', function () {
        // given
        const satisfactionScore = 2.5;

        // when
        const error = catchErrSync(() => new UserCampaignSurvey({ userId: 1, campaignId: 2, satisfactionScore }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The satisfactionScore must be an integer between 1 and 5');
      });
    });
  });
});
