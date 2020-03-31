const { expect, sinon, domainBuilder } = require('../../../test-helper');

const faker = require('faker');

const createAssessmentForCampaign = require('../../../../lib/domain/usecases/create-assessment-for-campaign');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const { CampaignCodeError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-assessment-for-campaign', () => {

  const availableCampaignCode = 'ABCDEF123';
  const campaignRepository = { getByCode: () => undefined };
  const campaignParticipationRepository = { save: () => undefined, updateAssessmentId: ()=> undefined };
  const assessmentRepository = {
    save: () => undefined,
    get:  () => undefined };

  beforeEach(() => {
    sinon.stub(campaignRepository, 'getByCode');
    sinon.stub(assessmentRepository, 'save');
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(campaignParticipationRepository, 'save');
    sinon.stub(campaignParticipationRepository, 'updateAssessmentId');
  });

  context('when campaignCode not exist', () => {

    it('should throw an CampaignCodeError', () => {
      // given
      campaignRepository.getByCode.resolves(null);

      // when
      const promise = createAssessmentForCampaign({
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
    let userId;
    let campaign;
    let assessment;
    let campaignParticipation;

    beforeEach(() => {
      userId = faker.random.number();
      // given
      campaign = domainBuilder.buildCampaign.ofTypeAssessment({
        id: 'campaignId',
      });

      campaignParticipation = new CampaignParticipation({
        campaignId: campaign.id,
        userId,
      });

      assessment = domainBuilder.buildAssessment({
        id: 'assessmentId',
        type: 'SMART_PLACEMENT',
        userId,
        campaignParticipationId: campaignParticipation.id
      });

      campaignRepository.getByCode.resolves(campaign);
      assessmentRepository.save.resolves(assessment);
      assessmentRepository.get.resolves(assessment);
      campaignParticipationRepository.updateAssessmentId.resolves({});
      campaignParticipationRepository.save.resolves({});
    });

    it('should save the assessment', () => {
      // when
      const promise = createAssessmentForCampaign({
        userId,
        assessment,
        codeCampaign: availableCampaignCode,
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

    it('should save a campaign-participation without participantExternalId', () => {
      // when
      const promise = createAssessmentForCampaign({
        userId,
        assessment,
        codeCampaign: availableCampaignCode,
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

    it('should save a campaign-participation with participantExternalId', () => {
      // when
      const promise = createAssessmentForCampaign({
        userId,
        assessment,
        codeCampaign: availableCampaignCode,
        participantExternalId: 'matricule123',
        campaignRepository,
        assessmentRepository,
        campaignParticipationRepository
      });

      campaignParticipation.participantExternalId = 'matricule123';

      // then
      return promise.then(() => {
        expect(campaignParticipationRepository.save).to.have.been.called;
        expect(campaignParticipationRepository.save).to.have.been.calledWith(campaignParticipation);
      });
    });

    it('should return the newly created assessment', () => {
      // when
      const promise = createAssessmentForCampaign({
        userId,
        assessment,
        codeCampaign: availableCampaignCode,
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
