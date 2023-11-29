import { expect, sinon } from '../../../../../test-helper.js';
import { PlacesLot } from '../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';

describe('Unit | Domain | ReadModels | PlacesLot', function () {
  let clock;
  const now = new Date('2021-05-01');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  describe('#count', function () {
    it('should return 0 if count is null', function () {
      const placeLot = new PlacesLot({
        count: null,
        activationDate: new Date(),
        expirationDate: new Date(),
        deletedAt: null,
      });

      expect(placeLot.count).to.equal(0);
    });

    it('should return count', function () {
      const placeLot = new PlacesLot({
        count: 10,
        activationDate: new Date(),
        expirationDate: new Date(),
        deletedAt: null,
      });

      expect(placeLot.count).to.equal(10);
    });
  });

  describe('#isActive', function () {
    it('should return true when place lots is active', function () {
      const placeLots = new PlacesLot({
        count: 1,
        activationDate: new Date('2021-04-01'),
        expirationDate: new Date('2021-12-31'),
        deletedAt: null,
      });

      expect(placeLots.isActive).to.be.true;
    });

    it('should return false when place lots is expired', function () {
      const placeLots = new PlacesLot({
        count: 1,
        activationDate: new Date('2021-04-20'),
        expirationDate: new Date('2021-04-30'),
        deletedAt: null,
      });

      expect(placeLots.isActive).to.be.false;
    });

    it('should return false when place lots is not active yet', function () {
      const placeLots = new PlacesLot({
        count: 1,
        expirationDate: new Date('2021-07-07'),
        activationDate: new Date('2021-06-06'),
        deletedAt: null,
      });

      expect(placeLots.isActive).to.be.false;
    });

    it('should return 0 when there are only deleted place lots', function () {
      const placeLots = new PlacesLot({
        count: 1,
        expirationDate: new Date('2021-07-07'),
        activationDate: new Date('2021-06-06'),
        deletedAt: new Date('2021-05-05'),
      });

      expect(placeLots.isActive).to.be.false;
    });
  });
});
