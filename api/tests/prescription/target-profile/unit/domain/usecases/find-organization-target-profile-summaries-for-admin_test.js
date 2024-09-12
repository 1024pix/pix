import { findOrganizationTargetProfileSummariesForAdmin } from '../../../../../../src/prescription/target-profile/domain/usecases/find-organization-target-profile-summaries-for-admin.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | find-organization-target-profile-summaries-for-admin', function () {
  it('should return the result of the repository call', async function () {
    // given
    const targetProfileAdministrationRepository = {
      findByOrganization: sinon.stub(),
    };
    const resultTargetProfiles = [domainBuilder.buildTargetProfileSummaryForAdmin()];
    targetProfileAdministrationRepository.findByOrganization
      .withArgs({ organizationId: 123 })
      .resolves(resultTargetProfiles);

    // when
    const response = await findOrganizationTargetProfileSummariesForAdmin({
      organizationId: 123,
      targetProfileAdministrationRepository,
    });

    // then
    expect(response).to.deep.equal(resultTargetProfiles);
  });
});
