import { expect } from 'chai';
import sinon from 'sinon';

import { getCampaignProgression } from '../../../../../src/evaluation/domain/services/get-campaign-progression.js';
import * as improvementService from '../../../../../src/evaluation/domain/services/improvement-service.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Domain | Services | get-campaign-progression', function () {
  const assessmentId = 1234;
  const userId = 456;
  const campaignId = 78;
  const campaignParticipationId = 12;
  const assessmentCreatedAt = new Date('2024-01-15');
  const sharedAt = new Date('2024-02-01');
  const skillIds = ['skillId1', 'skillId2'];

  let assessment;
  let knowledgeElementForParticipationService;
  let dependencies;

  beforeEach(function () {
    assessment = domainBuilder.buildAssessment.ofTypeCampaign({
      id: assessmentId,
      userId,
      campaignParticipationId,
      createdAt: assessmentCreatedAt,
      state: Assessment.states.STARTED,
    });

    const campaignParticipation = domainBuilder.buildCampaignParticipation({
      id: campaignParticipationId,
      campaign: domainBuilder.buildCampaign({ id: campaignId }),
      sharedAt,
    });

    const campaignParticipationRepository = { get: sinon.stub() };
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);

    const campaignRepository = { findSkillIds: sinon.stub() };
    campaignRepository.findSkillIds.withArgs({ campaignId }).resolves(skillIds);

    knowledgeElementForParticipationService = {
      findUniqByUserOrCampaignParticipationId: sinon.stub().resolves([]),
    };

    dependencies = {
      campaignParticipationRepository,
      campaignRepository,
      knowledgeElementForParticipationService,
      improvementService,
    };
  });

  context('when no progressionId is given', function () {
    it('should generate the progression id from the assessment id', async function () {
      // when
      const progression = await getCampaignProgression({ assessment, ...dependencies });

      // then
      expect(progression.id).to.equal(`progression-${assessmentId}`);
    });
  });

  context('when a progressionId is given', function () {
    it('should use it as the progression id', async function () {
      // when
      const progression = await getCampaignProgression({
        assessment,
        progressionId: 'progression-anotherId',
        ...dependencies,
      });

      // then
      expect(progression.id).to.equal('progression-anotherId');
    });
  });

  it('should limit the knowledge elements to those acquired before the participation was shared', async function () {
    // when
    await getCampaignProgression({ assessment, ...dependencies });

    // then
    expect(
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId,
    ).to.have.been.calledWithExactly({
      userId,
      campaignParticipationId,
      limitDate: sharedAt,
    });
  });

  it('should return the campaign skill ids and the knowledge elements still relevant for the assessment', async function () {
    // given
    const validatedKnowledgeElement = domainBuilder.buildKnowledgeElement.directlyValidated({
      id: 1,
      skillId: 'skillId1',
      createdAt: new Date('2024-01-01'),
    });
    const invalidatedKnowledgeElementFromCurrentAssessment = domainBuilder.buildKnowledgeElement.directlyInvalidated({
      id: 2,
      skillId: 'skillId2',
      createdAt: new Date('2024-01-20'),
    });
    const invalidatedKnowledgeElementFromPreviousAssessment = domainBuilder.buildKnowledgeElement.directlyInvalidated({
      id: 3,
      skillId: 'skillId2',
      createdAt: new Date('2024-01-14'),
    });
    knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId.resolves([
      validatedKnowledgeElement,
      invalidatedKnowledgeElementFromCurrentAssessment,
      invalidatedKnowledgeElementFromPreviousAssessment,
    ]);

    // when
    const progression = await getCampaignProgression({ assessment, ...dependencies });

    // then
    expect(progression.skillIds).to.deep.equal(skillIds);
    expect(progression.knowledgeElements).to.deep.equal([
      validatedKnowledgeElement,
      invalidatedKnowledgeElementFromCurrentAssessment,
    ]);
  });

  it('should flag the progression as completed when the assessment is completed', async function () {
    // given
    const completedAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
      id: assessmentId,
      userId,
      campaignParticipationId,
      createdAt: assessmentCreatedAt,
      state: Assessment.states.COMPLETED,
    });

    // when
    const progression = await getCampaignProgression({ assessment: completedAssessment, ...dependencies });

    // then
    expect(progression.isProfileCompleted).to.be.true;
  });
});
