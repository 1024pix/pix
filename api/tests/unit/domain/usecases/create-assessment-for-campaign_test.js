const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { CampaignCodeError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-assessment-for-campaign', () => {

  let sandbox;
  const availableCampaignCode = 'ABCDEF123';
  const campaignRepository = { getByCode: () => undefined };
  const assessmentRepository = { save: () => undefined };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(campaignRepository, 'getByCode');
    sandbox.stub(assessmentRepository, 'save');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw an CampaignCodeError if code Campaign not exist', () => {
    // given
    campaignRepository.getByCode.resolves(null);

    // when
    const promise = usecases.createAssessmentForCampaign({ assessment: {}, codeCampaign:availableCampaignCode,  campaignRepository, assessmentRepository });

    // then
    return expect(promise).to.be.rejectedWith(CampaignCodeError);
  });

  it('should save the campaign with name, userId, organizationId and generated code', () => {
    // given
    const campaign = factory.buildCampaign();
    campaignRepository.getByCode.resolves(campaign);
    const assessment = factory.buildAssessment({
      type: 'SMART_PLACEMENT',
    });

    // when
    const promise = usecases.createAssessmentForCampaign({ assessment, codeCampaign:availableCampaignCode,  campaignRepository, assessmentRepository });

    // then
    return promise.then(() => {
      expect(assessmentRepository.save).to.have.been.called;
      expect(assessmentRepository.save).to.have.been.calledWith(assessment);
    });
  });

  it('should return the newly created assessment', () => {
    // given
    const campaign = factory.buildCampaign();
    const assessment = factory.buildAssessment({
      type: 'SMART_PLACEMENT',
    });

    campaignRepository.getByCode.resolves(campaign);
    assessmentRepository.save.resolves(assessment);

    // when
    const promise = usecases.createAssessmentForCampaign({ assessment, codeCampaign:availableCampaignCode,  campaignRepository, assessmentRepository });

    // then
    return promise.then((assessmentCreated) => {
      expect(assessmentCreated).to.deep.equal(assessment);
    });
  });

});
