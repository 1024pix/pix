import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { handleStageAcquisition } from '../../../../lib/domain/usecases/stages/handle-stage-acquisition.js';

describe('Unit | UseCase | handleStageAcquisition', function () {
  // Repositories
  let campaignParticipationRepository;
  let stageAcquisitionRepository;
  let knowledgeElementRepository;
  let campaignSkillRepository;
  let campaignRepository;
  let stageRepository;
  let skillRepository;

  // Services
  let convertLevelStagesIntoThresholdsService;
  let getMasteryPercentageService;
  let getNewAcquiredStagesService;

  let dependencies;

  beforeEach(function () {
    campaignParticipationRepository = { get: sinon.stub() };
    stageAcquisitionRepository = { getStageIdsByCampaignParticipation: sinon.stub(), saveStages: sinon.stub() };
    stageRepository = { getByCampaignParticipationId: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    campaignRepository = { findSkillIdsByCampaignParticipationId: sinon.stub() };
    skillRepository = { findOperativeByIds: sinon.stub() };
    campaignSkillRepository = { getSkillIdsByCampaignId: sinon.stub() };

    getNewAcquiredStagesService = { getNewAcquiredStages: sinon.stub() };
    getMasteryPercentageService = { getMasteryPercentage: sinon.stub() };
    convertLevelStagesIntoThresholdsService = { convertLevelStagesIntoThresholds: sinon.stub() };

    dependencies = {
      campaignParticipationRepository,
      campaignSkillRepository,
      stageAcquisitionRepository,
      knowledgeElementRepository,
      campaignRepository,
      stageRepository,
      skillRepository,
      convertLevelStagesIntoThresholdsService,
      getMasteryPercentageService,
      getNewAcquiredStagesService,
    };
  });

  context('when assessment is not of type campaign', function () {
    it('should not attempt to create any stages acquisition', async function () {
      // given
      campaignParticipationRepository.get.rejects('I should not be called');
      stageRepository.getByCampaignParticipationId.rejects('I should not be called');
      stageAcquisitionRepository.getStageIdsByCampaignParticipation.rejects('I should not be called');

      const assessmentCertification = domainBuilder.buildAssessment.ofTypeCertification();
      const assessmentCompetenceEvaluation = domainBuilder.buildAssessment.ofTypeCompetenceEvaluation();

      // when
      await handleStageAcquisition({ ...dependencies, assessment: assessmentCertification });
      await handleStageAcquisition({ ...dependencies, assessment: assessmentCompetenceEvaluation });

      // then
      expect(stageAcquisitionRepository.saveStages).to.not.have.been.called;
    });
  });

  context('when assessment is of type campaign', function () {
    context('no stages are associated with this campaign', function () {
      it('should not attempt to create any stages acquisition', async function () {
        const assessment = domainBuilder.buildAssessment.ofTypeCampaign();
        const campaignParticipation = {
          id: 1,
        };

        // given
        campaignParticipationRepository.get
          .withArgs(assessment.campaignParticipationId)
          .resolves(campaignParticipation);
        stageRepository.getByCampaignParticipationId.withArgs(campaignParticipation.id).resolves([]);
        stageAcquisitionRepository.getStageIdsByCampaignParticipation.withArgs(campaignParticipation.id).resolves([]);

        // when
        await handleStageAcquisition({ ...dependencies, assessment });

        // then
        expect(stageAcquisitionRepository.saveStages).to.not.have.been.called;
      });
    });

    context('there are associated stages', function () {
      it('it should attempt to create new stages', async function () {
        const assessment = domainBuilder.buildAssessment.ofTypeCampaign();
        const campaign = domainBuilder.buildCampaign({});
        const stages = [
          domainBuilder.buildStage({ targetProfileId: campaign.targetProfileId }),
          domainBuilder.buildStage({ targetProfileId: campaign.targetProfileId }),
        ];
        const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign: campaign });
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ id: 1, assessmentId: assessment.id, skillId: '1' }),
          domainBuilder.buildKnowledgeElement({ id: 2, assessmentId: assessment.id, skillId: '2' }),
        ];

        // given
        campaignParticipationRepository.get
          .withArgs(assessment.campaignParticipationId)
          .resolves(campaignParticipation);
        stageRepository.getByCampaignParticipationId.withArgs(campaignParticipation.id).resolves(stages);
        getNewAcquiredStagesService.getNewAcquiredStages.returns(stages);
        stageAcquisitionRepository.getStageIdsByCampaignParticipation.withArgs(campaignParticipation.id).resolves([]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({
            campaignParticipationId: assessment.campaignParticipationId,
          })
          .resolves([1, 2, 3]);

        // when
        await handleStageAcquisition({ ...dependencies, assessment });

        // then
        expect(stageAcquisitionRepository.saveStages).to.have.been.called;
      });
    });

    context('stages have levels', function () {
      it('it should call convertLevelStagesIntoThresholdsService service', async function () {
        const assessment = domainBuilder.buildAssessment.ofTypeCampaign();
        const campaign = domainBuilder.buildCampaign({});
        const skills = Symbol('skills');
        skillRepository.findOperativeByIds.returns(skills);
        const stages = [
          domainBuilder.buildStage({ targetProfileId: campaign.targetProfileId, level: 1, threshold: null }),
          domainBuilder.buildStage({ targetProfileId: campaign.targetProfileId, level: 2, threshold: null }),
        ];
        const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign: campaign });
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ id: 1, assessmentId: assessment.id, skillId: '1' }),
          domainBuilder.buildKnowledgeElement({ id: 2, assessmentId: assessment.id, skillId: '2' }),
        ];
        campaignParticipationRepository.get
          .withArgs(assessment.campaignParticipationId)
          .resolves(campaignParticipation);
        stageRepository.getByCampaignParticipationId.withArgs(campaignParticipation.id).resolves(stages);
        getNewAcquiredStagesService.getNewAcquiredStages.returns(stages);
        stageAcquisitionRepository.getStageIdsByCampaignParticipation.withArgs(campaignParticipation.id).resolves([]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({
            campaignParticipationId: assessment.campaignParticipationId,
          })
          .resolves([1, 2, 3]);

        // when
        await handleStageAcquisition({ ...dependencies, assessment });

        // then
        expect(convertLevelStagesIntoThresholdsService.convertLevelStagesIntoThresholds).to.have.been.calledWithExactly(
          stages,
          skills,
        );
      });
    });
  });
});
