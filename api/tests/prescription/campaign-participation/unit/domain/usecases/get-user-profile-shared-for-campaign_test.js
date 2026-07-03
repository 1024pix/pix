import sinon from 'sinon';

import { Scorecard } from '../../../../../../src/evaluation/domain/models/Scorecard.js';
import { getSharedCampaignParticipationProfile } from '../../../../../../src/prescription/campaign-participation/domain/usecases/get-shared-campaign-participation-profile.js';
import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_SCORE } from '../../../../../../src/shared/constants.js';
import { NoCampaignParticipationForUserAndCampaign } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-shared-campaign-participation-profile', function () {
  const sharedAt = new Date('2020-02-01');
  const expectedCampaignParticipation = { id: '1', sharedAt, pixScore: 15 };
  const locale = 'fr';

  let campaignParticipationRepository;
  let knowledgeElementRepository;
  let competenceRepository;
  let areaRepository;
  let campaignRepository;
  let organizationLearnerRepository;
  let userId;
  let campaignId;
  let expectedMaxReachableLevel;
  let expectedMaxReachablePixScore;

  beforeEach(function () {
    expectedMaxReachableLevel = MAX_REACHABLE_LEVEL;
    expectedMaxReachablePixScore = MAX_REACHABLE_PIX_SCORE;
  });

  context('When user has shared its profile for the campaign', function () {
    beforeEach(function () {
      userId = Symbol('user id');
      campaignId = Symbol('campaign id');
      campaignParticipationRepository = { findOneByCampaignIdAndUserId: sinon.stub() };
      knowledgeElementRepository = { findUniqByUserIdGroupedByCompetenceId: sinon.stub() };
      competenceRepository = { listPixCompetencesOnly: sinon.stub() };
      areaRepository = { list: sinon.stub() };
      campaignRepository = { get: sinon.stub() };
      organizationLearnerRepository = { isActive: sinon.stub() };
      sinon.stub(Scorecard, 'buildFrom');
    });

    it('should return the shared profile for campaign', async function () {
      const knowledgeElements = { competence1: [], competence2: [] };
      const competences = [
        { id: 'competence1', areaId: 'area' },
        { id: 'competence2', areaId: 'area' },
      ];
      const area = domainBuilder.buildArea({ id: 'area' });
      const campaign = { multipleSendings: false };
      // given
      campaignParticipationRepository.findOneByCampaignIdAndUserId
        .withArgs({ userId, campaignId })
        .resolves(expectedCampaignParticipation);
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: sharedAt })
        .resolves(knowledgeElements);
      competenceRepository.listPixCompetencesOnly.withArgs({ locale: 'fr' }).resolves(competences);
      areaRepository.list.withArgs({ locale: 'fr' }).resolves([area]);
      campaignRepository.get.withArgs(campaignId).resolves(campaign);
      organizationLearnerRepository.isActive.withArgs({ campaignId, userId }).resolves(false);
      Scorecard.buildFrom
        .withArgs({ userId, knowledgeElements: knowledgeElements['competence1'], competence: competences[0], area })
        .returns({ id: 'Score1', earnedPix: 10 });
      Scorecard.buildFrom
        .withArgs({ userId, knowledgeElements: knowledgeElements['competence2'], competence: competences[1], area })
        .returns({ id: 'Score2', earnedPix: 5 });

      // when
      const sharedProfile = await getSharedCampaignParticipationProfile({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeElementRepository,
        competenceRepository,
        areaRepository,
        campaignRepository,
        organizationLearnerRepository,
        locale,
      });

      // then
      expect(sharedProfile).to.deep.equal({
        id: '1',
        sharedAt,
        pixScore: 15,
        canRetry: false,
        scorecards: [
          { id: 'Score1', earnedPix: 10 },
          { id: 'Score2', earnedPix: 5 },
        ],
        maxReachableLevel: expectedMaxReachableLevel,
        maxReachablePixScore: expectedMaxReachablePixScore,
      });
    });
  });

  context('When user has not shared its profile', function () {
    it('should throw an error', async function () {
      // given
      campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(null);

      // when
      const result = await catchErr(getSharedCampaignParticipationProfile)({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeElementRepository,
        competenceRepository,
        campaignRepository,
        organizationLearnerRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(NoCampaignParticipationForUserAndCampaign);
      expect(result.message).to.be.equal("L'utilisateur n'a pas encore participé à la campagne");
    });
  });
});
