import { PlacesLot } from '../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';
import { expect, sinon } from '../../../../../test-helper.js';

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
    it('should return count', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 10,
        activationDate: new Date(),
        expirationDate: new Date(),
        deletedAt: null,
      });

      expect(placesLot.count).to.equal(10);
    });
  });

  describe('#isActive', function () {
    it('should return true when place lots is active', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-04-01'),
        expirationDate: new Date('2021-12-31'),
        deletedAt: null,
      });

      expect(placesLot.isActive).to.be.true;
    });

    it('should return false when place lots is expired', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-04-20'),
        expirationDate: new Date('2021-04-30'),
        deletedAt: null,
      });

      expect(placesLot.isActive).to.be.false;
    });

    it('should return false when place lots is not active yet', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        expirationDate: new Date('2021-07-07'),
        activationDate: new Date('2021-06-06'),
        deletedAt: null,
      });

      expect(placesLot.isActive).to.be.false;
    });

    it('should return 0 when there are only deleted place lots', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        expirationDate: new Date('2021-07-07'),
        activationDate: new Date('2021-06-06'),
        deletedAt: new Date('2021-05-05'),
      });

      expect(placesLot.isActive).to.be.false;
    });
  });

  describe('#id', function () {
    it('should return id', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-04-01'),
        expirationDate: new Date('2021-12-31'),
        deletedAt: null,
      });

      expect(placesLot.expirationDate).to.deep.equal(new Date('2021-12-31'));
    });
  });

  describe('#activationDate', function () {
    it('should return activation date', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-04-01'),
        expirationDate: new Date('2021-12-31'),
        deletedAt: null,
      });

      expect(placesLot.activationDate).to.deep.equal(new Date('2021-04-01'));
    });
  });

  describe('#expirationDate', function () {
    it('should return activation date', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-04-01'),
        expirationDate: new Date('2021-12-31'),
        deletedAt: null,
      });

      expect(placesLot.expirationDate).to.deep.equal(new Date('2021-12-31'));
    });
  });

  describe('#status', function () {
    it('should return Active status', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-04-01'),
        expirationDate: new Date('2021-12-31'),
        deletedAt: null,
      });

      expect(placesLot.status).to.equal('ACTIVE');
    });

    it('should return Expired status', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-04-01'),
        expirationDate: new Date('2021-04-30'),
        deletedAt: null,
      });

      expect(placesLot.status).to.equal('EXPIRED');
    });

    it('should return Pending status', function () {
      const placesLot = new PlacesLot({
        id: 1,
        count: 1,
        activationDate: new Date('2021-07-01'),
        expirationDate: new Date('2021-09-30'),
        deletedAt: null,
      });

      expect(placesLot.status).to.equal('PENDING');
    });
  });
});
