import sinon from 'sinon';

import * as campaignParticipationRepository from '../../../../../src/quest/infrastructure/repositories/campaign-participation-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Repositories | campaign-participation', function () {
  let campaignParticipationsApiStub;
  const organizationLearnerId = 123;
  const campaignId = 456;
  const mockApiResult = Symbol('internalApiResult');

  beforeEach(async function () {
    campaignParticipationsApiStub = {
      getCampaignParticipationsByLearnerIdAndCampaignId: sinon.stub(),
      deleteCampaignParticipations: sinon.stub(),
    };
    campaignParticipationsApiStub.getCampaignParticipationsByLearnerIdAndCampaignId
      .withArgs({ organizationLearnerId, campaignId })
      .resolves(mockApiResult);
    campaignParticipationsApiStub.deleteCampaignParticipations.resolves(mockApiResult);
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
      expect(campaignParticipationsApiStub.getCampaignParticipationsByLearnerIdAndCampaignId).to.be.calledWithExactly({
        organizationLearnerId,
        campaignId,
      });
      expect(result).to.deep.equal(mockApiResult);
    });
  });
  describe('#deleteCampaignParticipationInCombinedCourse', function () {
    it('should call deleteCampaignParticipationInCombinedCourse method from campaignParticipationsApi', async function () {
      //given
      const userId = Symbol(123);
      const campaignId = Symbol(456);
      const campaignParticipationIds = Symbol(789);
      const userRole = Symbol('admin');
      const client = Symbol('client');
      const keepPreviousDeletion = Symbol('true');

      // when
      const result = await campaignParticipationRepository.deleteCampaignParticipations({
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
      expect(result).to.deep.equal(mockApiResult);
    });
  });
});
