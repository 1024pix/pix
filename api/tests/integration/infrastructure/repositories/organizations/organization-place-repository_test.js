const { expect, databaseBuilder } = require('../../../../test-helper');
const organizationPlaceRepository = require('../../../../../lib/infrastructure/repositories/organizations/organization-place-repository');
const OrganizationPlace = require('../../../../../lib/domain/read-models/OrganizationPlace');

describe('Integration | Repository | Organization Place', function () {
  describe('#find', function () {
    it('should return organization place model for given id', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const user = databaseBuilder.factory.buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' });
      const placeGZ = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 66,
        category: 'T2',
        reference: 'Godzilla',
        activationDate: new Date('2014-05-13'),
        expiredDate: new Date('2021-07-01'),
        createdBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlaceRepository.find(organizationId);

      // then
      expect(foundOrganizationPlace[0].id).to.equal(placeGZ.id);
      expect(foundOrganizationPlace[0].count).to.equal(placeGZ.count);
      expect(foundOrganizationPlace[0].status).to.equal(OrganizationPlace.statuses.EXPIRED);
      expect(foundOrganizationPlace[0].category).to.equal(OrganizationPlace.categories[placeGZ.category]);
      expect(foundOrganizationPlace[0].reference).to.equal(placeGZ.reference);
      expect(foundOrganizationPlace[0].creatorFullName).to.equal(`${user.firstName} ${user.lastName}`);

      expect(foundOrganizationPlace[0].activationDate).to.deep.equal(placeGZ.activationDate);
      expect(foundOrganizationPlace[0].expiredDate).to.deep.equal(placeGZ.expiredDate);
    });

    it('should return organization places for given id', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      const placeSG1 = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        reference: 'Stargate SG-1',
      });

      const placeAtlantis = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        reference: 'Stargate Atlantis',
      });

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId: otherOrganizationId,
        reference: 'Stargate Universe',
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlaceRepository.find(organizationId);

      // then
      expect(foundOrganizationPlace.length).to.equal(2);
      expect([foundOrganizationPlace[0].reference, foundOrganizationPlace[1].reference]).to.have.members([
        placeSG1.reference,
        placeAtlantis.reference,
      ]);
    });

    it('should return empty when no places defined', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlaceRepository.find(organizationId);
      // then
      expect(foundOrganizationPlace.length).to.equal(0);
    });

    it("should return creator place's name for given id", async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ firstName: 'Jack', lastName: "O'Neill" });
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        reference: 'Stargate SG-1',
        createdBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlaceRepository.find(organizationId);

      // then
      expect(foundOrganizationPlace[0].creatorFullName).to.equal(`${user.firstName} ${user.lastName}`);
    });

    describe('When activationDate are different', function () {
      it('should return organization places in descending order for activationDate', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1994-10-28'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlaceRepository.find(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace2.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace1.id);
      });
    });

    describe('When activationDate are identical', function () {
      it('should return organization places in descending order for expiredDate', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expiredDate: new Date('2011-05-09'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expiredDate: new Date('2007-03-13'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlaceRepository.find(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace1.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace2.id);
      });
    });

    describe('When activationDate and expiredDate are identical', function () {
      it('should return organization places in descending order for createdAt', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expiredDate: new Date('2007-03-13'),
          createdAt: new Date('1994-10-28'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expiredDate: new Date('2007-03-13'),
          createdAt: new Date('1997-07-27'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlaceRepository.find(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace2.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace1.id);
      });
    });
  });
});
