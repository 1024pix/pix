const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const User = require('../../../../lib/domain/models/User');
const OrganizationRole = require('../../../../lib/domain/models/Organization');
const Organization = require('../../../../lib/domain/models/OrganizationRole');
const OrganizationAccess = require('../../../../lib/domain/models/OrganizationAccess');

describe('Unit | UseCase | create-user-organization-access', () => {

  it('should succeed', () => {
    // given
    const user = new User({ id: 1 });
    const organization = new Organization({ id: 2 });

    const organizationAccessRepository = { create: sinon.stub() };
    organizationAccessRepository.create.resolves();

    // when
    const promise = usecases.createUserOrganizationAccess({ user, organization, organizationAccessRepository });

    // then
    return expect(promise).to.be.fulfilled.then(() => {
      const organizationRole = new OrganizationRole({ id: 1, name: 'ADMIN' });
      const organizationAccess = new OrganizationAccess({ user, organization, organizationRole });
      expect(organizationAccessRepository.create).to.have.been.calledWithMatch(organizationAccess);
    });
  });
});
