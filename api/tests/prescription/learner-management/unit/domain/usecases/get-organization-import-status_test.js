import { getOrganizationImportStatus } from '../../../../../../src/prescription/learner-management/domain/usecases/get-organization-import-status.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Organization Learners Management | Get Organization Import status', function () {
  let organizationImportRepository, resultSymbol;

  beforeEach(function () {
    resultSymbol = Symbol('result');
    organizationImportRepository = {
      getLastImportDetailForOrganization: sinon.stub().resolves(resultSymbol),
    };
  });

  it('should return an OrganizationImport ', async function () {
    // given
    const organizationId = Symbol('orga_id');

    // when
    const result = await getOrganizationImportStatus({
      organizationId,
      organizationImportRepository,
    });

    // then
    expect(organizationImportRepository.getLastImportDetailForOrganization).to.have.been.calledWithExactly(
      organizationId,
    );
    expect(result).to.eq(resultSymbol);
  });
});
