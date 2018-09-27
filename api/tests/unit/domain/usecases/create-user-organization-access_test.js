const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | create-user-organization-access', () => {

  it('should succeed', () => {
    // given
    const userId = 1;
    const organizationId = 1;

    const userRepository = { get: sinon.stub() };
    const organizationRepository = { get: sinon.stub() };
    const organizationRoleRepository = { getByName: sinon.stub() };
    const organizationAccessRepository = { create: sinon.stub() };
    organizationAccessRepository.create.resolves();

    // when
    const promise = usecases.createUserOrganizationAccess({ userId, organizationId, userRepository, organizationRepository, organizationRoleRepository, organizationAccessRepository });

    // then
    return expect(promise).to.be.fulfilled.then(() => {
      expect(userRepository.get).to.have.been.calledWith(userId);
      expect(organizationRepository.get).to.have.been.calledWith(organizationId);
      expect(organizationRoleRepository.getByName).to.have.been.calledWith('ADMIN');
      expect(organizationAccessRepository.create).to.have.been.calledOnce;
    });
  });
});
