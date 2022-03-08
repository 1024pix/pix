const { expect, sinon } = require('../../../test-helper');
const archiveOrganization = require('../../../../lib/domain/usecases/archive-organization');
const OrganizationToArchive = require('../../../../lib/domain/models/OrganizationToArchive');

describe('Unit | UseCase | archive-organization', function () {
  let organizationToArchiveRepository;

  beforeEach(function () {
    organizationToArchiveRepository = {
      save: sinon.stub(),
    };
  });

  it('should archive the organization', async function () {
    // given
    const now = new Date('2022-02-22');
    const clock = sinon.useFakeTimers(now);
    const organizationId = 1;

    organizationToArchiveRepository.save.resolves();

    // when
    await archiveOrganization({
      organizationId,
      organizationToArchiveRepository,
    });

    // then
    const expectedOrganizationToArchive = new OrganizationToArchive({ id: organizationId });
    expectedOrganizationToArchive.archive();

    expect(organizationToArchiveRepository.save).to.have.been.calledWith(expectedOrganizationToArchive);

    clock.restore();
  });
});
