const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findSmartPlacementAssessments = require('../../../../lib/domain/usecases/find-smart-placement-assessments');

describe('Unit | UseCase | find-smart-placement-assessments', () => {

  const assessmentRepository = {
    findLastSmartPlacementAssessmentByUserIdAndCampaignCode: () => {
    },
  };

  it('should resolve assessments that match userId and belong to the user but has no campaign participation', () => {
    // given
    const userId = 1234;
    const filters = { type: 'SMART_PLACEMENT', codeCampaign: 'Code' };
    domainBuilder.buildAssessment.ofTypeSmartPlacement({
      userId,
      campaignParticipation: null,
    });
    sinon.stub(assessmentRepository, 'findLastSmartPlacementAssessmentByUserIdAndCampaignCode').resolves(null);

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
    const campaign = domainBuilder.buildCampaign.ofTypeAssessment({ code: campaignCode });
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign });
    const assessment = domainBuilder.buildAssessment.ofTypeSmartPlacement({
      userId,
      campaignParticipation
    });
    sinon.stub(assessmentRepository, 'findLastSmartPlacementAssessmentByUserIdAndCampaignCode').resolves(assessment);

    // when
    const promise = findSmartPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });
});
