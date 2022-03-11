const { expect, sinon, domainBuilder } = require('../../../test-helper');
const archiveOrganization = require('../../../../lib/domain/usecases/archive-organization');
const OrganizationToArchive = require('../../../../lib/domain/models/OrganizationToArchive');

describe('Unit | UseCase | archive-organization', function () {
  it('should archive the organization', async function () {
    // given
    const organizationToArchiveRepository = {
      save: sinon.stub(),
    };
    const organizationForAdminRepository = {
      get: sinon.stub(),
    };
    const now = new Date('2022-02-22');
    const clock = sinon.useFakeTimers(now);
    const organizationId = 1;
    const pixMasterUser = domainBuilder.buildUser({
      id: 123,
    });
    const expectOrganizationForAdmin = domainBuilder.buildOrganizationForAdmin({
      archivedAt: now,
    });

    organizationToArchiveRepository.save.resolves();
    organizationForAdminRepository.get.resolves(expectOrganizationForAdmin);

    // when
    const archivedOrganizationForAdmin = await archiveOrganization({
      organizationId,
      userId: pixMasterUser.id,
      organizationToArchiveRepository,
      organizationForAdminRepository,
    });

    // then
    const expectedOrganizationToArchive = new OrganizationToArchive({ id: organizationId });
    expectedOrganizationToArchive.archive({ archivedBy: pixMasterUser.id });

    expect(organizationToArchiveRepository.save).to.have.been.calledWith(expectedOrganizationToArchive);
    expect(organizationForAdminRepository.get).to.have.been.calledWith(organizationId);
    expect(archivedOrganizationForAdmin).to.deep.equal(expectOrganizationForAdmin);
    clock.restore();
  });
});
