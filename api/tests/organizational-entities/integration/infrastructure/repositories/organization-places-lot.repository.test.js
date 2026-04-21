import { PlacesLot } from '../../../../../src/organizational-entities/domain/read-models/PlacesLot.js';
import * as organizationPlacesLotRepository from '../../../../../src/organizational-entities/infrastructure/repositories/organization-places-lot.repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Organizational-Entities | Infrastructure |Repositories | Organization-Places-Lot', function () {
  describe('#findAllByOrganizationIds', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    it('should return array of PlacesLot model', async function () {
      databaseBuilder.factory.buildOrganizationPlace({ organizationId });
      await databaseBuilder.commit();

      const places = await organizationPlacesLotRepository.findAllByOrganizationIds({
        organizationIds: [organizationId],
      });

      expect(places[0]).to.be.instanceOf(PlacesLot);
    });

    it('should return empty array if there is no placeslots', async function () {
      await databaseBuilder.commit();

      const places = await organizationPlacesLotRepository.findAllByOrganizationIds({
        organizationIds: [organizationId],
      });

      expect(places).to.be.empty;
    });

    it('should return placeslots if there are places for given organizationId', async function () {
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

      const places = await organizationPlacesLotRepository.findAllByOrganizationIds({
        organizationIds: [organizationId],
      });

      expect(places).to.have.lengthOf(2);
      expect(places[0].count).to.equal(7);
      expect(places[1].count).to.equal(3);
    });

    it('should not return places from another organizationId', async function () {
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationPlace({ organizationId });
      await databaseBuilder.commit();

      const places = await organizationPlacesLotRepository.findAllByOrganizationIds({
        organizationIds: [anotherOrganizationId],
      });

      expect(places).to.have.lengthOf(0);
    });
  });
});
