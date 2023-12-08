import { expect, sinon } from '../../../../../test-helper.js';
import { PlaceStatistics } from '../../../../../../src/prescription/organization-place/domain/read-models/PlaceStatistics.js';
import { PlacesLot } from '../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';

describe('Unit | Domain | ReadModels | PlaceStatistics', function () {
  let clock;
  const now = new Date('2021-05-01');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
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
});
