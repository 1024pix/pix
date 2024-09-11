import { knex } from '../../../../../../db/knex-database-connection.js';
import * as categories from '../../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import { OrganizationPlacesLotForManagement } from '../../../../../../src/prescription/organization-place/domain/models/OrganizationPlacesLotForManagement.js';
import { OrganizationPlacesLotManagement } from '../../../../../../src/prescription/organization-place/domain/read-models/OrganizationPlacesLotManagement.js';
import { PlacesLot } from '../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';
import * as organizationPlacesLotRepository from '../../../../../../src/prescription/organization-place/infrastructure/repositories/organization-places-lot-repository.js';
import { DeletedError, NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | Organization Places Lot', function () {
  describe('#findByOrganizationId', function () {
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
        expirationDate: new Date('2021-07-01'),
        createdBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

      // then
      expect(foundOrganizationPlace[0].id).to.equal(placeGZ.id);
      expect(foundOrganizationPlace[0].count).to.equal(placeGZ.count);
      expect(foundOrganizationPlace[0].status).to.equal(OrganizationPlacesLotManagement.statuses.EXPIRED);
      expect(foundOrganizationPlace[0].category).to.equal(OrganizationPlacesLotManagement.categories[placeGZ.category]);
      expect(foundOrganizationPlace[0].reference).to.equal(placeGZ.reference);
      expect(foundOrganizationPlace[0].creatorFullName).to.equal(`${user.firstName} ${user.lastName}`);

      expect(foundOrganizationPlace[0].activationDate).to.deep.equal(placeGZ.activationDate);
      expect(foundOrganizationPlace[0].expirationDate).to.deep.equal(placeGZ.expirationDate);
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
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

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
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);
      // then
      expect(foundOrganizationPlace.length).to.equal(0);
    });

    it('should not take into account deleted places', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        reference: 'Stargate SG-1',
        deletedAt: new Date('2020-01-10'),
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

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
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

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
        const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace2.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace1.id);
      });
    });

    describe('When activationDate are identical', function () {
      it('should return organization places in descending order for expirationDate', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          createdAt: new Date('1996-12-31'),
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2011-05-09'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          createdAt: new Date('1997-01-01'),
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2007-03-13'),
        });
        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace1.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace2.id);
      });
    });

    describe('When activationDate and expirationDate are identical', function () {
      it('should return organization places in descending order for createdAt', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2007-03-13'),
          createdAt: new Date('1994-10-28'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2007-03-13'),
          createdAt: new Date('1997-07-27'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace2.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace1.id);
      });
    });
  });

  describe('#findAllByOrganizationId', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    it('should return array of PlaceLot model', async function () {
      databaseBuilder.factory.buildOrganizationPlace({ organizationId });
      await databaseBuilder.commit();

      const places = await organizationPlacesLotRepository.findAllByOrganizationId(organizationId);

      expect(places[0]).to.be.instanceOf(PlacesLot);
    });

    it('should return empty array if there is no placelots', async function () {
      await databaseBuilder.commit();

      const places = await organizationPlacesLotRepository.findAllByOrganizationId(organizationId);

      expect(places).to.be.empty;
    });

    it('should return placelots if there are places for given organizationId', async function () {
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 7,
      });
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 3,
        deletedAt: new Date(),
      });
      await databaseBuilder.commit();

      const places = await organizationPlacesLotRepository.findAllByOrganizationId(organizationId);

      expect(places.length).to.equal(2);
      expect(places[0].count).to.equal(7);
      expect(places[1].count).to.equal(3);
    });

    it('should not return places from another organizationId', async function () {
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationPlace({ organizationId });
      await databaseBuilder.commit();

      const places = await organizationPlacesLotRepository.findAllByOrganizationId(anotherOrganizationId);

      expect(places.length).to.equal(0);
    });
  });

  describe('#findAllByOrganizationIds', function () {
    let firstOrganizationId;
    let secondOrganizationId;

    beforeEach(async function () {
      firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
      secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    it('should return empty array if there is no placesLot', async function () {
      const organizationIds = [firstOrganizationId, secondOrganizationId];

      const places = await organizationPlacesLotRepository.findAllByOrganizationIds(organizationIds);

      expect(places).to.be.empty;
    });

    it('should return places if there are places for given organizationIds', async function () {
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId: firstOrganizationId,
        count: 7,
      });
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId: secondOrganizationId,
        count: 3,
      });
      await databaseBuilder.commit();
      const organizationIds = [firstOrganizationId, secondOrganizationId];

      const places = await organizationPlacesLotRepository.findAllByOrganizationIds(organizationIds);

      expect(places.length).to.equal(2);
      expect(places[0]).to.be.an.instanceOf(PlacesLot);
      expect(places[1]).to.be.an.instanceOf(PlacesLot);

      const firstOrganizationIdPlaces = places.find((place) => place.organizationId === firstOrganizationId);
      expect(firstOrganizationIdPlaces.count).to.equal(7);

      const secondOrganizationIdPlaces = places.find((place) => place.organizationId === secondOrganizationId);
      expect(secondOrganizationIdPlaces.count).to.equal(3);
    });

    it('should not return places for others organization than given', async function () {
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId: firstOrganizationId,
        count: 7,
      });
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId: secondOrganizationId,
        count: 3,
      });
      await databaseBuilder.commit();
      const organizationIds = [firstOrganizationId];

      const places = await organizationPlacesLotRepository.findAllByOrganizationIds(organizationIds);
      expect(places.length).to.equal(1);
      expect(places[0].organizationId).to.equal(firstOrganizationId);
    });
  });

  describe('#create', function () {
    it('should create the given lot of places', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const user = databaseBuilder.factory.buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' });

      const placesToSave = new OrganizationPlacesLotForManagement({
        organizationId,
        count: 66,
        category: categories.FREE_RATE,
        reference: 'Godzilla',
        activationDate: new Date('2014-05-13'),
        expirationDate: new Date('2021-07-01'),
        createdBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const createdOrganizationPlacesLotId = await organizationPlacesLotRepository.create(placesToSave);

      // then
      const places = await knex('organization-places').where('id', createdOrganizationPlacesLotId).first();
      expect(places).to.deep.include(placesToSave);
    });
  });

  describe('#delete', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: Date.now(),
        toFake: ['Date'],
      });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should mark place as deleted', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' });
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace();

      await databaseBuilder.commit();

      // when
      await organizationPlacesLotRepository.remove({
        id: organizationPlace.id,
        deletedBy: user.id,
      });

      // then
      const places = await knex('organization-places').where('id', organizationPlace.id).first();
      expect(places.deletedBy).to.equal(user.id);
      expect(places.deletedAt).to.deep.equal(new Date());
    });

    it('should throw an error if already deleted place', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' });
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace({
        deletedAt: new Date('2021-01-01'),
        deletedBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const error = await catchErr(organizationPlacesLotRepository.remove)({
        id: organizationPlace.id,
        deletedBy: user.id,
      });

      // then
      expect(error).to.be.an.instanceOf(DeletedError);
    });

    it('should not mark place as deleted if already deleted place', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' });
      const organizationPlace = databaseBuilder.factory.buildOrganizationPlace({
        deletedAt: new Date('2021-01-01'),
        deletedBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      await catchErr(organizationPlacesLotRepository.remove)({
        id: organizationPlace.id,
        deletedBy: user.id,
      });

      const places = await knex('organization-places').where('id', organizationPlace.id).first();

      // then
      expect(places.deletedAt).to.be.deep.equal(organizationPlace.deletedAt);
      expect(places.deletedBy).to.be.equal(organizationPlace.deletedBy);
    });
  });

  describe('#get', function () {
    it('finds an organizationPlace by id', async function () {
      const organizationPlaceId = databaseBuilder.factory.buildOrganizationPlace().id;

      await databaseBuilder.commit();
      //when
      const organizationPlaceSet = await organizationPlacesLotRepository.get(organizationPlaceId);

      expect(organizationPlaceSet.id).to.equal(organizationPlaceId);
    });

    it('throws a not found error when organization Places lot is not found ', async function () {
      //given
      const organizationPlaceId = 0;
      //when
      const error = await catchErr(organizationPlacesLotRepository.get)(organizationPlaceId);

      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  describe('#findAllNotDeletedByOrganizationId', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2024-09-10'),
        toFake: ['Date'],
      });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return organization places for given id', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      const placeSG1 = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 12,
        deletedAt: null,
      });

      const placeAtlantis = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 120,
        deletedAt: null,
      });

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId: otherOrganizationId,
        count: 34,
        deletedAt: null,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace =
        await organizationPlacesLotRepository.findAllNotDeletedByOrganizationId(organizationId);

      // then
      expect(foundOrganizationPlace.length).to.equal(2);
      expect([foundOrganizationPlace[0].count, foundOrganizationPlace[1].count]).to.have.members([
        placeSG1.count,
        placeAtlantis.count,
      ]);
    });

    it('should return empty when no places defined', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);
      // then
      expect(foundOrganizationPlace.length).to.equal(0);
    });

    it('should not take into account deleted places', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 12,
        deletedAt: new Date('2020-01-10'),
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

      // then
      expect(foundOrganizationPlace.length).to.equal(0);
    });

    describe('the right order', function () {
      it('should ordered by status ACTIVE, PENDING and then EXPIRED', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlaceActive = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 22,
          activationDate: new Date('2023-09-10'),
          expirationDate: new Date('2025-09-10'),
        });

        const organizationPlaceExpired = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 12,
          activationDate: new Date('2022-09-10'),
          expirationDate: new Date('2023-09-10'),
        });

        const organizationPlacePending = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 22,
          activationDate: new Date('2025-09-10'),
          expirationDate: new Date('2026-09-10'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace =
          await organizationPlacesLotRepository.findAllNotDeletedByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].activationDate).to.deep.equal(organizationPlaceActive.activationDate);
        expect(foundOrganizationPlace[1].activationDate).to.deep.equal(organizationPlacePending.activationDate);
        expect(foundOrganizationPlace[2].activationDate).to.deep.equal(organizationPlaceExpired.activationDate);
      });

      it('should return organization places in descending order of expirationDate if same status', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlaceActive1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 22,
          activationDate: new Date('2023-09-10'),
          expirationDate: new Date('2025-09-10'),
        });

        const organizationPlaceActive2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 22,
          activationDate: new Date('2023-09-10'),
          expirationDate: new Date('2026-09-10'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace =
          await organizationPlacesLotRepository.findAllNotDeletedByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].expirationDate).to.deep.equal(organizationPlaceActive2.expirationDate);
        expect(foundOrganizationPlace[1].expirationDate).to.deep.equal(organizationPlaceActive1.expirationDate);
      });

      it('should return organization places in descending order of activationDate if same status and expiration date', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlaceActive1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 22,
          activationDate: new Date('2022-09-10'),
          expirationDate: new Date('2025-09-10'),
        });

        const organizationPlaceActive2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 22,
          activationDate: new Date('2023-09-10'),
          expirationDate: new Date('2025-09-10'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace =
          await organizationPlacesLotRepository.findAllNotDeletedByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].activationDate).to.deep.equal(organizationPlaceActive2.activationDate);
        expect(foundOrganizationPlace[1].activationDate).to.deep.equal(organizationPlaceActive1.activationDate);
      });

      it('should return organization places in ascending order of createdAt if same status, expiration date and activationDate', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlaceActive1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 12,
          activationDate: new Date('2023-09-10'),
          expirationDate: new Date('2025-09-10'),
          createdAt: new Date('2023-07-10'),
        });

        const organizationPlaceActive2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          count: 20,
          activationDate: new Date('2023-09-10'),
          expirationDate: new Date('2025-09-10'),
          createdAt: new Date('2023-08-10'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace =
          await organizationPlacesLotRepository.findAllNotDeletedByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].count).to.deep.equal(organizationPlaceActive2.count);
        expect(foundOrganizationPlace[1].count).to.deep.equal(organizationPlaceActive1.count);
      });
    });
  });
});
