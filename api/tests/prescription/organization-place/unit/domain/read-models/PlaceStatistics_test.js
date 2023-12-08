import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { PlaceStatistics } from '../../../../../../src/prescription/organization-place/domain/read-models/PlaceStatistics.js';
import { PlacesLot } from '../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';
import { OrganizationCantGetPlacesStatisticsError } from '../../../../../../src/prescription/organization-place/domain/errors.js';

describe('Unit | Domain | ReadModels | PlaceStatistics', function () {
  let clock;
  const now = new Date('2021-05-01');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  describe('#buildFrom', function () {
    it('builds a PlaceStatistics with an id', function () {
      const organizationId = 1;
      const placeStatistics = PlaceStatistics.buildFrom({ organizationId });

      expect(placeStatistics).is.instanceof(PlaceStatistics);
      expect(placeStatistics.id).to.includes(organizationId);
    });
  });

  describe('#id', function () {
    it('should create an id including organizationId', function () {
      const organizationId = 1;
      const placeStatistics = PlaceStatistics.buildFrom({ organizationId });

      expect(placeStatistics.id).to.equal(`${organizationId}_place_statistics`);
    });
  });

  describe('#total', function () {
    it('should return 0 when there are no places lots', function () {
      const statistics = new PlaceStatistics();

      expect(statistics.total).to.equal(0);
    });

    it('should return total when there is a places lot', function () {
      const statistics = new PlaceStatistics({
        placesLots: [
          new PlacesLot({
            count: 1,
            expirationDate: new Date('2021-05-02'),
            activationDate: new Date('2021-04-01'),
            deletedAt: null,
          }),
        ],
      });

      expect(statistics.total).to.equal(1);
    });

    it('should return total when there are places lots', function () {
      const statistics = new PlaceStatistics({
        placesLots: [
          new PlacesLot({
            count: 1,
            expirationDate: new Date('2021-05-02'),
            activationDate: new Date('2021-04-01'),
            deletedAt: null,
          }),
          new PlacesLot({
            count: 1,
            expirationDate: new Date('2021-05-02'),
            activationDate: new Date('2021-04-01'),
            deletedAt: null,
          }),
        ],
      });

      expect(statistics.total).to.equal(2);
    });
  });

  describe('#occupied', function () {
    it('should return 0 when there is no participant', function () {
      const statistics = new PlaceStatistics();

      expect(statistics.occupied).to.equal(0);
    });

    it('should return count of occupied places when there are participant', function () {
      const statistics = new PlaceStatistics({ numberOfParticipantWithAtLeastOneParticipation: 1 });

      expect(statistics.occupied).to.equal(1);
    });
  });

  describe('#available', function () {
    it('should return 0 when there are no place lots', function () {
      const statistics = new PlaceStatistics();

      expect(statistics.available).to.equal(0);
    });

    it('should return total when there are no participants', function () {
      const statistics = new PlaceStatistics({
        placesLots: [
          new PlacesLot({
            count: 1,
            expirationDate: new Date('2021-05-02'),
            activationDate: new Date('2021-04-01'),
            deletedAt: null,
          }),
        ],
      });

      expect(statistics.available).to.equal(1);
    });

    it('should return total of avalaible places when there are less participant than total places', function () {
      const statistics = new PlaceStatistics({
        placesLots: [
          new PlacesLot({
            count: 2,
            expirationDate: new Date('2021-05-02'),
            activationDate: new Date('2021-04-01'),
            deletedAt: null,
          }),
        ],
        numberOfParticipantWithAtLeastOneParticipation: 1,
      });

      expect(statistics.available).to.equal(1);
    });

    it('should return 0 when there are more participant than total places', function () {
      const statistics = new PlaceStatistics({
        placesLots: [
          { count: 2, expirationDate: new Date('2021-05-02'), activationDate: new Date('2021-04-01'), deletedAt: null },
        ],
        numberOfParticipantWithAtLeastOneParticipation: 3,
      });

      expect(statistics.available).to.equal(0);
    });
  });

  describe('#validate', function () {
    it('should throw an error if all places count are null', async function () {
      const error = await catchErr(() => {
        new PlaceStatistics({
          placesLots: [
            new PlacesLot({
              count: null,
              expirationDate: new Date('2021-05-02'),
              activationDate: new Date('2021-04-01'),
              deletedAt: null,
            }),
            new PlacesLot({
              count: null,
              expirationDate: new Date('2021-03-02'),
              activationDate: new Date('2021-02-01'),
              deletedAt: new Date('2021-01-01'),
            }),
            new PlacesLot({
              count: null,
              expirationDate: new Date('2022-04-02'),
              activationDate: new Date('2022-04-01'),
              deletedAt: null,
            }),
          ],
        });
      })();

      expect(error).to.be.an.instanceof(OrganizationCantGetPlacesStatisticsError);
      expect(error.message).to.equal("L'organisation ne peut pas avoir de statistiques sur ses lots de places.");
    });
  });
});
