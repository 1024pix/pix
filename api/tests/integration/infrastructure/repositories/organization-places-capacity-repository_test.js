import sinon from 'sinon';
import { expect, databaseBuilder } from '../../../test-helper';
import organizationPlacesCapacityRepository from '../../../../lib/infrastructure/repositories/organization-places-capacity-repository';
import categories from '../../../../lib/domain/constants/organization-places-categories';

describe('Integration | Infrastructure | Repository | OrganizationPlacesCapacityRepository', function () {
  describe('#findByOrganizationId', function () {
    let organizationId;
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers(new Date(Date.parse('10/10/2021')));
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return 0 if there is no places', async function () {
      const organizationPlacesCapacity = await organizationPlacesCapacityRepository.findByOrganizationId(
        organizationId
      );

      expect(organizationPlacesCapacity.categories).to.have.deep.members([
        { category: categories.FREE_RATE, count: 0 },
        { category: categories.PUBLIC_RATE, count: 0 },
        { category: categories.REDUCE_RATE, count: 0 },
        { category: categories.SPECIAL_REDUCE_RATE, count: 0 },
        { category: categories.FULL_RATE, count: 0 },
      ]);
    });

    it('should not take into acccount deleted places', async function () {
      databaseBuilder.factory.buildOrganizationPlace({
        category: categories.T0,
        count: 10,
        deletedAt: new Date('2020-01-01'),
        organizationId,
      });
      await databaseBuilder.commit();

      const organizationPlacesCapacity = await organizationPlacesCapacityRepository.findByOrganizationId(
        organizationId
      );

      expect(organizationPlacesCapacity.categories).to.have.deep.members([
        { category: categories.FREE_RATE, count: 0 },
        { category: categories.PUBLIC_RATE, count: 0 },
        { category: categories.REDUCE_RATE, count: 0 },
        { category: categories.SPECIAL_REDUCE_RATE, count: 0 },
        { category: categories.FULL_RATE, count: 0 },
      ]);
    });

    it('should return count if there are places', async function () {
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T0, count: 10, organizationId });
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T1, count: 5, organizationId });
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T2, count: 2, organizationId });
      databaseBuilder.factory.buildOrganizationPlace({
        category: categories.T2bis,
        count: 20,
        organizationId,
      });
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T3, count: 1, organizationId });
      await databaseBuilder.commit();

      const organizationPlacesCapacity = await organizationPlacesCapacityRepository.findByOrganizationId(
        organizationId
      );

      expect(organizationPlacesCapacity.categories).to.have.deep.members([
        { category: categories.FREE_RATE, count: 10 },
        { category: categories.PUBLIC_RATE, count: 5 },
        { category: categories.REDUCE_RATE, count: 2 },
        { category: categories.SPECIAL_REDUCE_RATE, count: 20 },
        { category: categories.FULL_RATE, count: 1 },
      ]);
    });

    it('should sum places lot of a same category', async function () {
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T0, count: 10, organizationId });
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T0, count: 10, organizationId });
      await databaseBuilder.commit();

      const organizationPlacesCapacity = await organizationPlacesCapacityRepository.findByOrganizationId(
        organizationId
      );

      expect(organizationPlacesCapacity.categories).to.include.deep.members([
        { category: categories.FREE_RATE, count: 20 },
      ]);
    });

    it('should return places capacity for a specific organization', async function () {
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T0, count: 10, organizationId });
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationPlace({
        category: categories.T0,
        count: 1,
        organizationId: otherOrganizationId,
      });
      await databaseBuilder.commit();

      const organizationPlacesCapacity = await organizationPlacesCapacityRepository.findByOrganizationId(
        organizationId
      );

      expect(organizationPlacesCapacity.categories).to.include.deep.members([
        { category: categories.FREE_RATE, count: 10 },
      ]);
    });

    it('should not take in account expired places lot', async function () {
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T0, count: 10, organizationId });
      databaseBuilder.factory.buildOrganizationPlace({
        category: categories.T0,
        count: 1,
        expirationDate: new Date(Date.parse('01/10/2021')),
        organizationId,
      });
      await databaseBuilder.commit();

      const organizationPlacesCapacity = await organizationPlacesCapacityRepository.findByOrganizationId(
        organizationId
      );

      expect(organizationPlacesCapacity.categories).to.include.deep.members([
        { category: categories.FREE_RATE, count: 10 },
      ]);
    });

    it('should not take in account places lot that are not activated yet', async function () {
      databaseBuilder.factory.buildOrganizationPlace({ category: categories.T0, count: 10, organizationId });
      databaseBuilder.factory.buildOrganizationPlace({
        category: categories.T0,
        count: 1,
        activationDate: new Date(Date.parse('11/10/2021')),
        organizationId,
      });
      await databaseBuilder.commit();

      const organizationPlacesCapacity = await organizationPlacesCapacityRepository.findByOrganizationId(
        organizationId
      );

      expect(organizationPlacesCapacity.categories).to.include.deep.members([
        { category: categories.FREE_RATE, count: 10 },
      ]);
    });
  });
});
