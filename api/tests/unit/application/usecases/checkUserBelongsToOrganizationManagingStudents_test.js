const { expect, sinon, domainBuilder } = require('../../../test-helper');
const usecase = require('../../../../lib/application/usecases/checkUserBelongsToOrganizationManagingStudents');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');

describe('Unit | Application | Use Case | checkUserBelongsToOrganizationManagingStudents', () => {

  beforeEach(() => {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
  });

  it('should return true when user belongs to organization managing students', async () => {
    // given
    const userId = 1234;

    const organization = domainBuilder.buildOrganization({ isManagingStudents: true });
    const membership = domainBuilder.buildMembership({ organization });
    membershipRepository.findByUserIdAndOrganizationId.resolves([membership]);

    // when
    const response = await usecase.execute(userId, organization.id);

    // then
    expect(response).to.equal(true);
  });

  it('should return false when organization does not manage students', async () => {
    // given
    const userId = 1234;

    const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
    const membership = domainBuilder.buildMembership({ organization });
    membershipRepository.findByUserIdAndOrganizationId.resolves([membership]);

    // when
    const response = await usecase.execute(userId, organization.id);

    // then
    expect(response).to.equal(false);
  });

  it('should return false when user is not a member of organization', async () => {
    // given
    const userId = 1234;

    const organization = domainBuilder.buildOrganization({ isManagingStudents: true });
    membershipRepository.findByUserIdAndOrganizationId.resolves([]);

    // when
    const response = await usecase.execute(userId, organization.id);

    // then
    expect(response).to.equal(false);
  });
});
