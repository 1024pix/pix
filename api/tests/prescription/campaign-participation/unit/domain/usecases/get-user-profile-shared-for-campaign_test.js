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
  let knowledgeStateRepository;
  let knowledgeStateSnapshotRepository;
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
    let competences;
    let area;

    beforeEach(function () {
      userId = Symbol('user id');
      campaignId = Symbol('campaign id');
      campaignParticipationRepository = { findOneByCampaignIdAndUserId: sinon.stub() };
      knowledgeStateRepository = { findByUserId: sinon.stub() };
      knowledgeStateSnapshotRepository = { findByCampaignParticipationIds: sinon.stub() };
      competenceRepository = { listPixCompetencesOnly: sinon.stub() };
      areaRepository = { list: sinon.stub() };
      campaignRepository = { get: sinon.stub() };
      organizationLearnerRepository = { isActive: sinon.stub() };
      sinon.stub(Scorecard, 'buildFrom');

      competences = [
        { id: 'competence1', areaId: 'area' },
        { id: 'competence2', areaId: 'area' },
      ];
      area = domainBuilder.buildArea({ id: 'area' });
      const campaign = { multipleSendings: false };
      campaignParticipationRepository.findOneByCampaignIdAndUserId
        .withArgs({ userId, campaignId })
        .resolves(expectedCampaignParticipation);
      competenceRepository.listPixCompetencesOnly.withArgs({ locale: 'fr' }).resolves(competences);
      areaRepository.list.withArgs({ locale: 'fr' }).resolves([area]);
      campaignRepository.get.withArgs(campaignId).resolves(campaign);
      organizationLearnerRepository.isActive.withArgs({ campaignId, userId }).resolves(false);
    });

    it('should return the profile frozen in the snapshot written at sharing time', async function () {
      // given
      const snapshotState = domainBuilder.buildKnowledgeState.forSkills({
        validatedSkillIds: ['skillComp1'],
        competenceId: 'competence1',
      });
      knowledgeStateSnapshotRepository.findByCampaignParticipationIds.withArgs(['1']).resolves({ 1: snapshotState });
      Scorecard.buildFrom
        .onFirstCall()
        .returns({ id: 'Score1', earnedPix: 10 })
        .onSecondCall()
        .returns({ id: 'Score2', earnedPix: 5 });

      // when
      const sharedProfile = await getSharedCampaignParticipationProfile({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeStateRepository,
        knowledgeStateSnapshotRepository,
        competenceRepository,
        areaRepository,
        campaignRepository,
        organizationLearnerRepository,
        locale,
      });

      // then
      expect(knowledgeStateRepository.findByUserId).to.not.have.been.called;
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

    it('should fall back on the current knowledge state when no snapshot exists', async function () {
      // given
      const liveState = domainBuilder.buildKnowledgeState.forSkills({
        validatedSkillIds: ['skillComp1'],
        competenceId: 'competence1',
      });
      knowledgeStateSnapshotRepository.findByCampaignParticipationIds.withArgs(['1']).resolves({});
      knowledgeStateRepository.findByUserId.withArgs({ userId }).resolves(liveState);
      Scorecard.buildFrom
        .onFirstCall()
        .returns({ id: 'Score1', earnedPix: 10 })
        .onSecondCall()
        .returns({ id: 'Score2', earnedPix: 0 });

      // when
      const sharedProfile = await getSharedCampaignParticipationProfile({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeStateRepository,
        knowledgeStateSnapshotRepository,
        competenceRepository,
        areaRepository,
        campaignRepository,
        organizationLearnerRepository,
        locale,
      });

      // then
      expect(sharedProfile.scorecards).to.deep.equal([
        { id: 'Score1', earnedPix: 10 },
        { id: 'Score2', earnedPix: 0 },
      ]);
    });
  });

  context('When user has not shared its profile', function () {
    it('should throw an error', async function () {
      // given
      const campaignParticipationRepository = { findOneByCampaignIdAndUserId: sinon.stub() };
      campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(null);

      // when
      const result = await catchErr(getSharedCampaignParticipationProfile)({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeStateRepository,
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
