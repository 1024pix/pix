import { expect, sinon, domainBuilder } from '../../../test-helper';
import archiveOrganization from '../../../../lib/domain/usecases/archive-organization';

describe('Unit | UseCase | archive-organization', function () {
  it('should archive the organization', async function () {
    // given
    const organizationForAdminRepository = {
      archive: sinon.stub(),
      get: sinon.stub(),
    };
    const now = new Date('2022-02-22');
    const clock = sinon.useFakeTimers(now);
    const organizationId = 1;
    const superAdminUser = domainBuilder.buildUser({
      id: 123,
      firstName: 'Clémen',
      lastName: 'Tine',
    });
    const expectedArchivedOrganization = domainBuilder.buildOrganizationForAdmin({
      archivedAt: now,
      archivistFirstName: superAdminUser.firstName,
      archivistLastName: superAdminUser.lastName,
    });

    organizationForAdminRepository.archive.resolves();
    organizationForAdminRepository.get.resolves(expectedArchivedOrganization);

    // when
    const archivedOrganizationForAdmin = await archiveOrganization({
      organizationId,
      userId: superAdminUser.id,
      organizationForAdminRepository,
    });

    // then
    expect(organizationForAdminRepository.archive).to.have.been.calledWith({
      id: organizationId,
      archivedBy: superAdminUser.id,
    });
    expect(organizationForAdminRepository.get).to.have.been.calledWith(organizationId);
    expect(archivedOrganizationForAdmin).to.deep.equal(expectedArchivedOrganization);
    clock.restore();
  });
});
