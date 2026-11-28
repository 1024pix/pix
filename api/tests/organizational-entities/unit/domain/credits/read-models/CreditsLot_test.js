import { expect } from 'chai';
import sinon from 'sinon';

import { CreditsLot } from '../../../../../../src/organizational-entities/domain/credits/read-models/CreditsLot.js';

describe('Unit | Organizational Entities | Domain | Model | CreditsLot', function () {
  beforeEach(function () {
    const now = new Date('2026-06-01');
    sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  describe('constructor', function () {
    it('should instanciate a CreditsLot from given attributes', function () {
      // when
      const inputAttributes = {
        id: 1,
        structureId: 123,
        count: 100,
        activationDate: '2023-01-01',
        expirationDate: '2023-12-31',
        reference: 'REF123',
        creatorFirstName: 'Bruce',
        creatorLastName: 'Banner',
      };

      const expectedCreditsLot = {
        id: 1,
        structureId: 123,
        count: 100,
        activationDate: '2023-01-01',
        expirationDate: '2023-12-31',
        reference: 'REF123',
        creatorFullName: 'Bruce Banner',
      };

      const creditsLot = new CreditsLot(inputAttributes);

      // then
      expect(creditsLot).to.deep.equal(expectedCreditsLot);
      expect(creditsLot).to.be.an.instanceOf(CreditsLot);
    });
  });

  describe('#status', function () {
    it("returns EXPIRED if creditsLot's expiration date is before now", function () {
      // given
      const expirationDate = '2025-12-31';

      // when
      const creditsLot = new CreditsLot({
        id: 1,
        count: 100,
        activationDate: '2025-01-01',
        expirationDate: expirationDate,
        reference: 'REF123',
        creatorFirstName: 'Bruce',
        creatorLastName: 'Banner',
      });

      // then
      expect(creditsLot.status).to.equal('EXPIRED');
    });

    it('returns ACTIVE if now is between activation date and expiration date', function () {
      // given
      const activationDate = '2026-01-01';
      const expirationDate = '2026-12-31';

      // when
      const creditsLot = new CreditsLot({
        id: 1,
        count: 100,
        activationDate: activationDate,
        expirationDate: expirationDate,
        reference: 'REF123',
        creatorFirstName: 'Bruce',
        creatorLastName: 'Banner',
      });

      // then
      expect(creditsLot.status).to.equal('ACTIVE');
    });

    it('returns PENDING if now is before activation date', function () {
      // given
      const activationDate = '2027-12-31';

      // when
      const creditsLot = new CreditsLot({
        id: 1,
        count: 100,
        activationDate: activationDate,
        expirationDate: '2028-01-01',
        reference: 'REF123',
        creatorFirstName: 'Bruce',
        creatorLastName: 'Banner',
      });

      // then
      expect(creditsLot.status).to.equal('PENDING');
    });
  });
});
