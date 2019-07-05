const { expect, sinon } = require('../../../test-helper');
const getOrganizationMemberships = require('../../../../lib/domain/usecases/get-organization-memberships');

describe('Unit | UseCase | get-organization-memberships', () => {

  it('should succeed', () => {
    // given
    const organizationId = 1234;
    const membershipRepositoryStub = { findByOrganizationId: sinon.stub() };
    membershipRepositoryStub.findByOrganizationId.resolves();

    // when
    const promise = getOrganizationMemberships({ organizationId, membershipRepository: membershipRepositoryStub });

    // then
    return expect(promise).to.be.fulfilled.then(() => {
      expect(membershipRepositoryStub.findByOrganizationId).to.have.been.calledWith({ organizationId, orderByName: true });
    });
  });
});
