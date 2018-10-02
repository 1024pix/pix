const { expect, databaseBuilder, factory } = require('../../../test-helper');
const OrganizationRole = require('../../../../lib/domain/models/OrganizationRole');
const { NotFoundError } = require('../../../../lib/domain/errors');
const organizationRoleRepository = require('../../../../lib/infrastructure/repositories/organization-role-repository');

describe('Integration | Repository | OrganizationRole', function() {

  describe('#getByName', () => {

    context('when it exist an organization role "ADMIN"', () => {

      const organizationRoleNameAdmin = 'ADMIN';

      beforeEach(async () => {
        const organizationRole = factory.buildOrganizationRole({ name: organizationRoleNameAdmin });
        databaseBuilder.factory.buildOrganizationRole(organizationRole);
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should resolve with an OrgnizationRole domain object', () => {
        // when
        const promise = organizationRoleRepository.getByName(organizationRoleNameAdmin);

        // then
        return expect(promise).to.be.fulfilled.then((organizationRole) => {
          expect(organizationRole).to.exist;
          expect(organizationRole).to.be.an.instanceof(OrganizationRole);
          expect(organizationRole.name).to.equal(organizationRoleNameAdmin);
        });
      });

      it('should reject with a NotFoundError domain object', () => {
        // given
        const inexistantOrganizationRoleName = 'INEXISTANT_ORGANIZATION_ROLE_NAME';

        // when
        const promise = organizationRoleRepository.getByName(inexistantOrganizationRoleName);

        // then
        return expect(promise).to.be.rejected.then((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(NotFoundError);
          expect(error.message).to.equal(`Not found organization role for name ${inexistantOrganizationRoleName}`);
        });
      });
    });
  });
});
