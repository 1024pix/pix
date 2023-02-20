import { expect, sinon, domainBuilder } from '../../../test-helper';
import usecases from '../../../../lib/domain/usecases';

describe('Unit | UseCase | find-organization-target-profile-summaries-for-admin', function () {
  it('should return the result of the repository call', async function () {
    // given
    const targetProfileSummaryForAdminRepository = {
      findByOrganization: sinon.stub(),
    };
    const resultTargetProfiles = [domainBuilder.buildTargetProfileSummaryForAdmin()];
    targetProfileSummaryForAdminRepository.findByOrganization
      .withArgs({ organizationId: 123 })
      .resolves(resultTargetProfiles);

    // when
    const response = await usecases.findOrganizationTargetProfileSummariesForAdmin({
      organizationId: 123,
      targetProfileSummaryForAdminRepository,
    });

    // then
    expect(response).to.deep.equal(resultTargetProfiles);
  });
});
