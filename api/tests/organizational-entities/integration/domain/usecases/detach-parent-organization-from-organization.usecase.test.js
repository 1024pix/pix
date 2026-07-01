import { UnableToDetachParentOrganizationFromChildOrganization } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | UseCases | detach-parent-organization-from-organization', function () {
  beforeEach(async function () {
    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
    await databaseBuilder.commit();
  });
  // TODO: ce test doit être mis à jour une fois qu'il sera décidé de l'impact du détachement d'organisation
  // eslint-disable-next-line mocha/no-pending-tests
  xit('should detach parent organization from child organization', async function () {
    // given
    const parentOrganization = databaseBuilder.factory.buildOrganization();

    const childOrganization = databaseBuilder.factory.buildOrganization({
      parentOrganizationId: parentOrganization.id,
    });

    await databaseBuilder.commit();

    // when
    await usecases.detachParentOrganizationFromOrganization({ childOrganizationId: childOrganization.id });

    // then
    const updatedOrganization = await knex('organizations').where({ id: childOrganization.id }).first();
    expect(updatedOrganization.parentOrganizationId).to.be.null;
  });

  it('should throw a Not Found error when child organization does not exist', async function () {
    // when
    try {
      await usecases.detachParentOrganizationFromOrganization({ childOrganizationId: 123 });
    } catch (error) {
      //then
      expect(error).to.be.instanceOf(NotFoundError);
    }
  });

  it('should throw a UnableToDetachParentOrganizationFromChildOrganization error when organization has no parent', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization({ parentOrganizationId: null });
    await databaseBuilder.commit();

    // when
    try {
      await usecases.detachParentOrganizationFromOrganization({ childOrganizationId: organization.id });
    } catch (error) {
      // then
      expect(error).to.be.instanceOf(UnableToDetachParentOrganizationFromChildOrganization);
      expect(error.meta.organizationId).to.equal(organization.id);
    }
  });
});
