import * as usecase from '../../../../../src/shared/application/usecases/checkUserBelongsToOrganizationManagingStudents.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Use Case | checkUserBelongsToOrganizationManagingStudents', function () {
  let membershipRepositoryStub;

  beforeEach(function () {
    membershipRepositoryStub = {
      findByUserIdAndOrganizationId: sinon.stub(),
    };
  });

  it('should return true when user belongs to organization managing students', async function () {
    // given
    const userId = 1234;

    const organization = domainBuilder.buildOrganization({ isManagingStudents: true });
    const membership = domainBuilder.buildMembership({ organization });
    membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([membership]);

    // when
    const response = await usecase.execute(userId, organization.id, { membershipRepository: membershipRepositoryStub });

    // then
    expect(response).to.equal(true);
  });

  it('should return false when organization does not manage students', async function () {
    // given
    const userId = 1234;

    const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
    const membership = domainBuilder.buildMembership({ organization });
    membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([membership]);

    // when
    const response = await usecase.execute(userId, organization.id, { membershipRepository: membershipRepositoryStub });

    // then
    expect(response).to.equal(false);
  });

  it('should return false when user is not a member of organization', async function () {
    // given
    const userId = 1234;

    const organization = domainBuilder.buildOrganization({ isManagingStudents: true });
    membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([]);

    // when
    const response = await usecase.execute(userId, organization.id, { membershipRepository: membershipRepositoryStub });

    // then
    expect(response).to.equal(false);
  });
});
