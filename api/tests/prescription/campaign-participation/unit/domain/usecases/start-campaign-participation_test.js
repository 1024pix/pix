import { CampaignParticipationStarted } from '../../../../../../lib/domain/events/CampaignParticipationStarted.js';
import { CampaignParticipant } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipant.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | start-campaign-participation', function () {
  const userId = 19837482;
  let campaignRepository;
  let campaignParticipantRepository;
  let campaignParticipationRepository;

  beforeEach(function () {
    campaignRepository = {
      findAllSkills: sinon.stub(),
      areKnowledgeElementsResettable: sinon.stub(),
    };
    campaignParticipantRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    campaignParticipationRepository = {
      get: sinon.stub(),
    };
  });

  it('should return CampaignParticipationStarted event', async function () {
    // given
    const domainTransaction = Symbol('transaction');
    const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation();
    const campaignParticipant = new CampaignParticipant({
      campaignToStartParticipation,
      organizationLearner: { id: null, hasParticipated: false },
      userIdentity: { id: userId },
    });
    const campaignParticipationAttributes = { campaignId: 12, participantExternalId: 'YvoLoL', isReset: false };
    const expectedCampaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
      id: 12,
    });

    const campaignParticipationStartedEvent = new CampaignParticipationStarted({
      campaignParticipationId: expectedCampaignParticipation.id,
    });

    campaignParticipantRepository.get
      .withArgs({ userId, campaignId: campaignParticipationAttributes.campaignId, domainTransaction })
      .resolves(campaignParticipant);

    sinon.stub(campaignParticipant, 'start');

    campaignParticipantRepository.save
      .withArgs({ campaignParticipant: sinon.match(campaignParticipant), domainTransaction })
      .resolves(12);

    campaignParticipationRepository.get.withArgs(12, domainTransaction).resolves(expectedCampaignParticipation);

    // when
    const { event, campaignParticipation } = await usecases.startCampaignParticipation({
      campaignParticipation: campaignParticipationAttributes,
      userId,
      campaignRepository,
      campaignParticipantRepository,
      campaignParticipationRepository,
      domainTransaction,
    });

    // then
    expect(campaignParticipant.start).to.have.been.calledWithExactly({
      participantExternalId: 'YvoLoL',
      isReset: campaignParticipationAttributes.isReset,
    });
    expect(event).to.deep.equal(campaignParticipationStartedEvent);
    expect(campaignParticipation).to.deep.equal(expectedCampaignParticipation);
    expect(campaignRepository.areKnowledgeElementsResettable).to.have.been.calledWithExactly({
      id: campaignParticipationAttributes.campaignId,
      domainTransaction,
    });
    expect(campaignRepository.findAllSkills).not.to.have.been.called;
  });

  context('when there is a reset campaign participation', function () {
    let domainTransaction;
    let campaignParticipationAttributes;
    let skills;
    let assessmentRepository;
    let knowledgeElementRepository;
    let competenceEvaluationRepository;
    let knowledgeElement;
    let knowledgeElementToReset;

    beforeEach(function () {
      domainTransaction = Symbol('transaction');
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation();
      const campaignParticipant = new CampaignParticipant({
        campaignToStartParticipation,
        organizationLearner: { id: null, hasParticipated: false },
        userIdentity: { id: userId },
      });
      campaignParticipationAttributes = { campaignId: 12, participantExternalId: 'YvoLoL' };

      campaignParticipantRepository.get
        .withArgs({ userId, campaignId: campaignParticipationAttributes.campaignId, domainTransaction })
        .resolves(campaignParticipant);

      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
        batchSave: sinon.stub(),
      };
      knowledgeElementToReset = domainBuilder.buildKnowledgeElement({ skillId: 'skillToReset' });
      knowledgeElement = domainBuilder.buildKnowledgeElement();
      knowledgeElementRepository.findUniqByUserId
        .withArgs({ userId, domainTransaction })
        .resolves([knowledgeElementToReset, knowledgeElement]);

      const knowledgeElements = [KnowledgeElement.reset(knowledgeElementToReset)];

      knowledgeElementRepository.batchSave.withArgs({ knowledgeElements, domainTransaction }).resolves();

      competenceEvaluationRepository = {
        findByUserId: sinon.stub(),
      };

      assessmentRepository = {
        setAssessmentsAsStarted: sinon.stub(),
      };

      skills = [{ id: 'skillToReset', tubeId: 'tubeId1', competenceId: 'competenceId1' }];
      campaignRepository.findAllSkills
        .withArgs({ campaignId: campaignParticipationAttributes.campaignId, domainTransaction })
        .resolves(skills);

      sinon.stub(campaignParticipant, 'start');
      campaignParticipantRepository.save
        .withArgs({ campaignParticipant: sinon.match(campaignParticipant), domainTransaction })
        .resolves(12);
      campaignParticipationRepository.get.withArgs(12, domainTransaction).resolves();
    });

    context('when campaign is resettable', function () {
      beforeEach(function () {
        campaignParticipationAttributes.isReset = true;
        campaignRepository.areKnowledgeElementsResettable
          .withArgs({ id: campaignParticipationAttributes.campaignId, domainTransaction })
          .resolves(true);
      });

      it('should retrieve skillIds to reset', async function () {
        // when
        await usecases.startCampaignParticipation({
          campaignParticipation: campaignParticipationAttributes,
          userId,
          campaignRepository,
          campaignParticipantRepository,
          campaignParticipationRepository,
          knowledgeElementRepository,
          competenceEvaluationRepository,
          domainTransaction,
        });

        // then
        expect(campaignRepository.findAllSkills).to.have.been.calledWithExactly({
          campaignId: campaignParticipationAttributes.campaignId,
          domainTransaction,
        });
      });

      it('should reset knowledgeElements of the campaign', async function () {
        // given
        const expectedKe = KnowledgeElement.reset(knowledgeElementToReset);
        knowledgeElementRepository.batchSave
          .withArgs({ knowledgeElements: [expectedKe], domainTransaction })
          .resolves();

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation: campaignParticipationAttributes,
          userId,
          campaignRepository,
          campaignParticipantRepository,
          campaignParticipationRepository,
          assessmentRepository,
          knowledgeElementRepository,
          competenceEvaluationRepository,
          domainTransaction,
        });

        // then
        expect(knowledgeElementRepository.batchSave).to.have.been.calledOnceWithExactly({
          knowledgeElements: [expectedKe],
          domainTransaction,
        });
      });

      it('should update assessment on competenceIds', async function () {
        // given
        const expectedUpdatedAssessmentIds = [Symbol('assessmentId1')];
        competenceEvaluationRepository.findByUserId.withArgs(userId).resolves([
          {
            competenceId: skills[0].competenceId,
            assessmentId: expectedUpdatedAssessmentIds[0],
          },
          { assessmentId: Symbol('assessmentId2') },
        ]);

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation: campaignParticipationAttributes,
          userId,
          campaignRepository,
          campaignParticipantRepository,
          campaignParticipationRepository,
          assessmentRepository,
          knowledgeElementRepository,
          competenceEvaluationRepository,
          domainTransaction,
        });

        // then
        expect(competenceEvaluationRepository.findByUserId).to.have.been.calledOnceWithExactly(userId);
        expect(assessmentRepository.setAssessmentsAsStarted).to.have.been.calledOnceWithExactly({
          assessmentIds: expectedUpdatedAssessmentIds,
          domainTransaction,
        });
      });
    });

    context('when campaign is not resettable', function () {
      it('should not retrieve skillIds to reset', async function () {
        campaignParticipationAttributes.isReset = true;
        campaignRepository.areKnowledgeElementsResettable
          .withArgs({ id: campaignParticipationAttributes.campaignId, domainTransaction })
          .resolves(false);

        // when
        await usecases.startCampaignParticipation({
          campaignParticipation: campaignParticipationAttributes,
          userId,
          assessmentRepository,
          campaignRepository,
          campaignParticipantRepository,
          campaignParticipationRepository,
          domainTransaction,
        });

        // then
        expect(campaignRepository.findAllSkills).not.to.have.been.called;
      });
    });
  });
});
