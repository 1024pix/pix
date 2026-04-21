import sinon from 'sinon';

import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CampaignParticipation } from '../../../../../src/quest/domain/models/CampaignParticipation.js';
import * as campaignParticipationRepository from '../../../../../src/quest/infrastructure/repositories/campaign-participation-repository.js';

describe('Quest | Unit | Infrastructure | Repositories | campaign-participation', function () {
  let expectedResult, campaignParticipationsApiStub;
  const organizationLearnerId = 1;
  const campaignId = 1;

  beforeEach(async function () {
    expectedResult = {
      id: 1,
      sharedAt: null,
      status: CampaignParticipationStatuses.SHARED,
    };

    campaignParticipationsApiStub = {
      getCampaignParticipationsByLearnerIdAndCampaignId: sinon.stub(),
      deleteCampaignParticipations: sinon.stub(),
    };
    campaignParticipationsApiStub.getCampaignParticipationsByLearnerIdAndCampaignId
      .withArgs({ organizationLearnerId, campaignId })
      .resolves(new CampaignParticipation(expectedResult));
  });
  describe('#getCampaignParticipationsByLearnerIdAndCampaignId', function () {
    it('should call getCampaignParticipationsByLearnerIdAndCampaignId method from campaignParticipationsApi', async function () {
      // when
      const result = await campaignParticipationRepository.getCampaignParticipationsByLearnerIdAndCampaignId({
        organizationLearnerId,
        campaignId,
        campaignParticipationsApi: campaignParticipationsApiStub,
      });

      // then
      expect(result).to.be.an.instanceof(CampaignParticipation);
      expect(result).to.deep.equal(expectedResult);
    });
  });
  describe('#deleteCampaignParticipationInCombinedCourse', function () {
    it('should call deleteCampaignParticipationInCombinedCourse method from campaignParticipationsApi', async function () {
      //given
      const userId = Symbol(1);
      const campaignId = Symbol(1);
      const campaignParticipationIds = Symbol(1);
      const userRole = Symbol('admin');
      const client = Symbol('client');
      const keepPreviousDeletion = Symbol('true');

      // when
      await campaignParticipationRepository.deleteCampaignParticipations({
        userId,
        campaignId,
        campaignParticipationIds,
        userRole,
        client,
        campaignParticipationsApi: campaignParticipationsApiStub,
        keepPreviousDeletion,
      });

      // then
      expect(campaignParticipationsApiStub.deleteCampaignParticipations).to.be.calledWithExactly({
        userId,
        campaignParticipationIds,
        campaignId,
        keepPreviousDeletion,
        userRole,
        client,
      });
    });
  });
});
