const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const { CampaignCodeError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-assessment-for-campaign', () => {

  let sandbox;
  const availableCampaignCode = 'ABCDEF123';
  const campaignRepository = { getByCode: () => undefined };
  const campaignParticipationRepository = { save: () => undefined };
  const assessmentRepository = { save: () => undefined };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(campaignRepository, 'getByCode');
    sandbox.stub(assessmentRepository, 'save');
    sandbox.stub(campaignParticipationRepository, 'save');
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when campaignCode not exist', () => {
    it('should throw an CampaignCodeError', () => {
      // given
      campaignRepository.getByCode.resolves(null);

      // when
      const promise = usecases.createAssessmentForCampaign({
        assessment: {},
        codeCampaign:availableCampaignCode,
        campaignRepository,
        assessmentRepository,
        campaignParticipationRepository
      });

      // then
      return expect(promise).to.be.rejectedWith(CampaignCodeError);
    });

  });

  context('when campaignCode exist', () => {
    let campaign;
    let assessment;
    let campaignParticipation;

    beforeEach(() => {
      // given
      campaign = factory.buildCampaign({
        id: 'campaignId',
      });
      assessment = factory.buildAssessment({
        id: 'assessmentId',
        type: 'SMART_PLACEMENT',
      });

      campaignParticipation = new CampaignParticipation({
        assessmentId: assessment.id,
        campaignId: campaign.id,
      });

      campaignRepository.getByCode.resolves(campaign);
      assessmentRepository.save.resolves(assessment);
      campaignParticipationRepository.save.resolves({});
    });

    it('should save the assessment', () => {
      // when
      const promise = usecases.createAssessmentForCampaign({
        assessment,
        codeCampaign:availableCampaignCode,
        campaignRepository,
        assessmentRepository,
        campaignParticipationRepository
      });

      // then
      return promise.then(() => {
        expect(assessmentRepository.save).to.have.been.called;
        expect(assessmentRepository.save).to.have.been.calledWith(assessment);
      });
    });

    it('should save a campaign-participation object', () => {
      // when
      const promise = usecases.createAssessmentForCampaign({
        assessment,
        codeCampaign:availableCampaignCode,
        campaignRepository,
        assessmentRepository,
        campaignParticipationRepository
      });

      // then
      return promise.then(() => {
        expect(campaignParticipationRepository.save).to.have.been.called;
        expect(campaignParticipationRepository.save).to.have.been.calledWith(campaignParticipation);
      });
    });

    it('should return the newly created assessment', () => {
      // when
      const promise = usecases.createAssessmentForCampaign({
        assessment,
        codeCampaign:availableCampaignCode,
        campaignRepository,
        assessmentRepository,
        campaignParticipationRepository
      });

      // then
      return promise.then((assessmentCreated) => {
        expect(assessmentCreated).to.deep.equal(assessment);
      });
    });

  });
});
