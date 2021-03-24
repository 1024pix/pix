const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findCampaignAssessments = require('../../../../lib/domain/usecases/find-campaign-assessments');

describe('Unit | UseCase | find-campaign-assessments', function() {

  const assessmentRepository = {
    findLastCampaignAssessmentByUserIdAndCampaignCode: () => {
    },
  };

  it('should resolve assessments that match userId and belong to the user but has no campaign participation', function() {
    // given
    const userId = 1234;
    const filters = { type: 'CAMPAIGN', codeCampaign: 'Code' };
    sinon.stub(assessmentRepository, 'findLastCampaignAssessmentByUserIdAndCampaignCode').resolves(null);

    // when
    const promise = findCampaignAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve assessments that match userId and belong to the user and has campaign participation', function() {
    // given
    const userId = 1234;
    const campaignCode = 'Code';
    const filters = { type: 'CAMPAIGN', codeCampaign: campaignCode };
    const campaign = domainBuilder.buildCampaign.ofTypeAssessment({ code: campaignCode });
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign });
    const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
      userId,
      campaignParticipation,
    });
    sinon.stub(assessmentRepository, 'findLastCampaignAssessmentByUserIdAndCampaignCode').resolves(assessment);

    // when
    const promise = findCampaignAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });
});
