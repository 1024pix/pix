const { expect, factory, sinon } = require('../../../test-helper');
const findSmartPlacementAssessments = require('../../../../lib/domain/usecases/find-smart-placement-assessments');

describe('Unit | UseCase | find-smart-placement-assessments', () => {

  const assessmentRepository = {
    findSmartPlacementAssessmentsByUserId: () => {
    },
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve assessments that match userId and belong to the user but has no campaign participation', () => {
    // given
    const userId = 1234;
    const filters = { type: 'SMART_PLACEMENT', codeCampaign: 'Code' };
    const assessment = factory.buildAssessment.ofTypeSmartPlacement({
      ...filters,
      userId,
    });
    sandbox.stub(assessmentRepository, 'findSmartPlacementAssessmentsByUserId').resolves([assessment]);

    // when
    const promise = findSmartPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve assessments that match userId and belong to the user and has campaign participation', () => {
    // given
    const userId = 1234;
    const campaignCode = 'Code';
    const filters = { type: 'SMART_PLACEMENT', codeCampaign: campaignCode };
    const campaign = factory.buildCampaign({ code: campaignCode });
    const campaignParticipation = factory.buildCampaignParticipation({ campaign });
    const assessment = factory.buildAssessment.ofTypeSmartPlacement({
      userId,
      campaignParticipation
    });
    sandbox.stub(assessmentRepository, 'findSmartPlacementAssessmentsByUserId').resolves([assessment]);

    // when
    const promise = findSmartPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });
});
