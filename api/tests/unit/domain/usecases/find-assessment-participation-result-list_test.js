import { expect, sinon } from '../../../test-helper';
import findAssessmentParticipationResultList from '../../../../lib/domain/usecases/find-assessment-participation-result-list';

describe('Unit | UseCase | find-assessment-participation-result-list', function () {
  it('return the assessmentParticipationResultMinimal list', async function () {
    const findPaginatedByCampaignId = sinon.stub();
    const campaignId = 1;
    const filters = Symbol('filters');
    const page = Symbol('page');
    const participations = Symbol('participations');
    findPaginatedByCampaignId.resolves(participations);

    const results = await findAssessmentParticipationResultList({
      campaignId,
      filters,
      page,
      campaignAssessmentParticipationResultListRepository: { findPaginatedByCampaignId },
    });

    expect(findPaginatedByCampaignId).to.have.been.calledWith({ page, campaignId, filters });
    expect(results).to.equal(participations);
  });
});
