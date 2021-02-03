const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findUserCampaignParticipationOverviews = require('../../../../lib/domain/usecases/find-user-campaign-participation-overviews');
const CampaignParticipationOverview = require('../../../../lib/domain/read-models/CampaignParticipationOverview');

describe('Unit | UseCase | find-user-campaign-participation-overviews', () => {

  let campaignParticipationOverviewRepository;
  let targetProfileWithLearningContentRepository;

  beforeEach(() => {
    campaignParticipationOverviewRepository = {
      findByUserIdWithFilters: sinon.stub().resolves({
        campaignParticipationOverviews: [],
        pagination: {},
      }),
    };
    targetProfileWithLearningContentRepository = {
      get: sinon.stub().resolves(domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent()),
    };
  });

  context('when states is undefined', () => {
    it('should call findByUserIdWithFilters', async () => {
      // given
      const states = undefined;
      const userId = 1;

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, { page: undefined, userId, states });
    });
  });

  context('when states is a string', () => {
    it('should call findByUserIdWithFilters with an array of states', async () => {
      // given
      const states = 'ONGOING';
      const userId = 1;
      const page = {};

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
        page,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, {
        page,
        userId,
        states: ['ONGOING'],
      });
    });
  });

  context('when states is an array', () => {
    it('should call findByUserIdWithFilters with an array of states', async () => {
      // given
      const states = ['ONGOING'];
      const userId = 1;
      const page = {};

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
        page,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, {
        page,
        userId,
        states: ['ONGOING'],
      });
    });
  });

  context('when it returns shared participations', () => {
    it('should compute the totalSkillsCount from targetProfile', async () => {
      // given
      const userId = 1;
      const campaignParticipationOverviews = [
        new CampaignParticipationOverview({ isShared: true, targetProfileId: 1, validatedSkillsCount: 1 }),
      ];
      campaignParticipationOverviewRepository = {
        findByUserIdWithFilters: sinon.stub().resolves({
          campaignParticipationOverviews,
          pagination: {},
        }),
      };

      // when
      const { campaignParticipationOverviews: overviews } = await findUserCampaignParticipationOverviews({
        userId,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
      });

      // then
      expect(overviews[0].validatedSkillsCount).equal(1);
      expect(overviews[0].totalSkillsCount).equal(1);
    });
  });

  context('when it returns not shared participations', () => {
    it('should not compute the totalSkillsCount', async () => {
      // given
      const userId = 1;
      const campaignParticipationOverviews = [
        new CampaignParticipationOverview({ isShared: false, targetProfileId: 1 }),
      ];
      campaignParticipationOverviewRepository = {
        findByUserIdWithFilters: sinon.stub().resolves({
          campaignParticipationOverviews,
          pagination: {},
        }),
      };

      // when
      const { campaignParticipationOverviews: overviews } = await findUserCampaignParticipationOverviews({
        userId,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
      });

      // then
      expect(overviews[0].validatedSkillsCount).to.not.exist;
      expect(overviews[0].totalSkillsCount).to.not.exist;
    });
  });
});
