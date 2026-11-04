import { expect } from 'chai';
import sinon from 'sinon';

import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { ltiCampaignRepository } from '../../../../../src/lti/infrastructure/repositories/lti-campaign.repository.js';

describe('Unit | LTI | Infrastructure | Repository | lti-campaign', function () {
  describe('#getLtiCampaigns', function () {
    let campaignsApi, combinedCourseApi;

    beforeEach(function () {
      campaignsApi = { getCampaignOverviews: sinon.stub() };
      combinedCourseApi = {
        findCombinedCourseIdsByOrganizationId: sinon.stub(),
        findCampaignIdsByCombinedCourseIds: sinon.stub(),
      };
    });

    it('calls the campaigns api with the given organization ids', async function () {
      // given
      campaignsApi.getCampaignOverviews.resolves([]);
      combinedCourseApi.findCombinedCourseIdsByOrganizationId.resolves([]);

      // when
      await ltiCampaignRepository.getLtiCampaigns({
        organizationIds: [1, 2],
        campaignsApi,
        combinedCourseApi,
      });

      // then
      expect(campaignsApi.getCampaignOverviews).to.have.been.calledOnceWithExactly({ organizationIds: [1, 2] });
    });

    it('looks for the combined courses of each organization, then for their campaigns', async function () {
      // given
      campaignsApi.getCampaignOverviews.resolves([]);
      combinedCourseApi.findCombinedCourseIdsByOrganizationId.withArgs(1).resolves([10, 11]);
      combinedCourseApi.findCombinedCourseIdsByOrganizationId.withArgs(2).resolves([20]);
      combinedCourseApi.findCampaignIdsByCombinedCourseIds.resolves([]);

      // when
      await ltiCampaignRepository.getLtiCampaigns({
        organizationIds: [1, 2],
        campaignsApi,
        combinedCourseApi,
      });

      // then
      expect(combinedCourseApi.findCombinedCourseIdsByOrganizationId).to.have.been.calledTwice;
      expect(combinedCourseApi.findCampaignIdsByCombinedCourseIds).to.have.been.calledOnceWithExactly([10, 11, 20]);
    });

    it('does not look for campaigns when organizations have no combined course', async function () {
      // given
      campaignsApi.getCampaignOverviews.resolves([]);
      combinedCourseApi.findCombinedCourseIdsByOrganizationId.resolves([]);

      // when
      await ltiCampaignRepository.getLtiCampaigns({
        organizationIds: [1],
        campaignsApi,
        combinedCourseApi,
      });

      // then
      expect(combinedCourseApi.findCampaignIdsByCombinedCourseIds).not.to.have.been.called;
    });

    it('returns LtiCampaign instances', async function () {
      // given
      const campaignOverview = {
        id: 1,
        code: 'ABCDEF123',
        name: 'Campagne 6A',
        type: 'ASSESSMENT',
        organizationName: 'Pix organization',
        organizationId: 5,
        description: 'Parcours rentrée 6ieme',
      };
      campaignsApi.getCampaignOverviews.resolves([campaignOverview]);
      combinedCourseApi.findCombinedCourseIdsByOrganizationId.resolves([]);

      // when
      const campaigns = await ltiCampaignRepository.getLtiCampaigns({
        organizationIds: [5],
        campaignsApi,
        combinedCourseApi,
      });

      // then
      expect(campaigns).to.have.lengthOf(1);
      expect(campaigns[0]).to.be.an.instanceOf(LtiCampaign);
      expect(campaigns[0]).to.deep.equal(new LtiCampaign(campaignOverview));
    });

    it('excludes campaigns belonging to combined courses', async function () {
      // given
      const campaignOverview = { id: 1, code: 'AAA', name: 'Hors parcours combiné' };
      const campaignInCombinedCourse = { id: 2, code: 'BBB', name: 'Dans un parcours combiné' };
      campaignsApi.getCampaignOverviews.resolves([campaignOverview, campaignInCombinedCourse]);
      combinedCourseApi.findCombinedCourseIdsByOrganizationId.resolves([10]);
      combinedCourseApi.findCampaignIdsByCombinedCourseIds.resolves([2]);

      // when
      const campaigns = await ltiCampaignRepository.getLtiCampaigns({
        organizationIds: [5],
        campaignsApi,
        combinedCourseApi,
      });

      // then
      expect(campaigns).to.have.lengthOf(1);
      expect(campaigns[0]).to.be.an.instanceOf(LtiCampaign);
      expect(campaigns[0].id).to.equal(1);
    });
  });

  describe('#getLtiCampaign', function () {
    it('calls the campaigns api and returns an LtiCampaign', async function () {
      // given
      const campaignOverview = {
        id: 1,
        code: 'ABCDEF123',
        name: 'Campagne 6A',
        type: 'ASSESSMENT',
        organizationName: 'Pix organization',
        organizationId: 5,
        description: 'Parcours rentrée 6ieme',
      };
      const campaignsApi = { getCampaignOverview: sinon.stub().resolves(campaignOverview) };

      // when
      const campaign = await ltiCampaignRepository.getLtiCampaign({ campaignId: 1, campaignsApi });

      // then
      expect(campaignsApi.getCampaignOverview).to.have.been.calledOnceWithExactly({ campaignId: 1 });
      expect(campaign).to.be.an.instanceOf(LtiCampaign);
      expect(campaign).to.deep.equal(new LtiCampaign(campaignOverview));
    });

    it('returns null when the campaign does not exist', async function () {
      // given
      const campaignsApi = { getCampaignOverview: sinon.stub().resolves(null) };

      // when
      const campaign = await ltiCampaignRepository.getLtiCampaign({ campaignId: 1, campaignsApi });

      // then
      expect(campaign).to.be.null;
    });
  });
});
