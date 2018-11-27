const { expect, sinon, domainBuilder } = require('../../../test-helper');

const faker = require('faker');

const createAssessmentForCampaign = require('../../../../lib/domain/usecases/create-assessment-for-campaign');
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
      campaign = domainBuilder.buildCampaign({
        id: 'campaignId',
      });
      assessment = domainBuilder.buildAssessment({
        id: 'assessmentId',
        type: 'SMART_PLACEMENT',
        userId
      });

      campaignParticipation = new CampaignParticipation({
        assessmentId: assessment.id,
        campaignId: campaign.id,
        userId,
      });

      campaignRepository.getByCode.resolves(campaign);
      assessmentRepository.save.resolves(assessment);
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
