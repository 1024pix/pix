import { expect } from 'chai';

import { ActiveCredits } from '../../../../../../src/organizational-entities/domain/credits/models/ActiveCredits.js';
import { CreditsLotBalance } from '../../../../../../src/organizational-entities/domain/credits/models/CreditsLotBalance.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Organizational Entities | Domain | Models | ActiveCredits', function () {
  describe('#lotToCharge', function () {
    it('returns null when there is no lot at all', function () {
      // given
      const activeCredits = new ActiveCredits([]);

      // then
      expect(activeCredits.lotToCharge).to.be.null;
    });

    it('returns the only active lot when it has capacity', function () {
      // given
      const lot = domainBuilder.buildCreditsLotBalance({ id: 1, count: 10, consumedCount: 3 });

      // when
      const activeCredits = new ActiveCredits([lot]);

      // then
      expect(activeCredits.lotToCharge).to.equal(lot);
    });

    it('charges the active lot expiring first', function () {
      // given
      const expiringLast = domainBuilder.buildCreditsLotBalance({ id: 1, expirationDate: '2999-12-31' });
      const expiringFirst = domainBuilder.buildCreditsLotBalance({ id: 2, expirationDate: '2100-01-01' });

      // when
      const activeCredits = new ActiveCredits([expiringLast, expiringFirst]);

      // then
      expect(activeCredits.lotToCharge).to.equal(expiringFirst);
    });

    it('skips a full lot and charges the next one expiring', function () {
      // given
      const fullButExpiringFirst = domainBuilder.buildCreditsLotBalance({
        id: 1,
        count: 10,
        consumedCount: 10,
        expirationDate: '2100-01-01',
      });
      const expiringLater = domainBuilder.buildCreditsLotBalance({
        id: 2,
        count: 10,
        consumedCount: 0,
        expirationDate: '2999-12-31',
      });

      // when
      const activeCredits = new ActiveCredits([fullButExpiringFirst, expiringLater]);

      // then
      expect(activeCredits.lotToCharge).to.equal(expiringLater);
    });

    it('returns null when every active lot is full', function () {
      // given
      const lots = [
        domainBuilder.buildCreditsLotBalance({ id: 1, count: 10, consumedCount: 10 }),
        domainBuilder.buildCreditsLotBalance({ id: 2, count: 5, consumedCount: 5 }),
      ];

      // when
      const activeCredits = new ActiveCredits(lots);

      // then
      expect(activeCredits.lotToCharge).to.be.null;
    });

    it('never charges an expired lot, even with capacity', function () {
      // given
      const expired = domainBuilder.buildCreditsLotBalance({ id: 1, expirationDate: '2021-01-01' });

      // when
      const activeCredits = new ActiveCredits([expired]);

      // then
      expect(activeCredits.lotToCharge).to.be.null;
    });

    it('never charges a lot that has not started yet', function () {
      // given
      const pending = domainBuilder.buildCreditsLotBalance({ id: 1, activationDate: '2999-01-01' });

      // when
      const activeCredits = new ActiveCredits([pending]);

      // then
      expect(activeCredits.lotToCharge).to.be.null;
    });

    it('settles a tie on the expiration date with the lowest id', function () {
      // given
      const secondLot = domainBuilder.buildCreditsLotBalance({ id: 2, expirationDate: '2999-12-31' });
      const firstLot = domainBuilder.buildCreditsLotBalance({ id: 1, expirationDate: '2999-12-31' });

      // when
      const activeCredits = new ActiveCredits([secondLot, firstLot]);

      // then
      expect(activeCredits.lotToCharge).to.equal(firstLot);
    });
  });

  describe('#lotIds', function () {
    it('lists the active lots only, ordered by expiration', function () {
      // given
      const lots = [
        domainBuilder.buildCreditsLotBalance({ id: 1, expirationDate: '2999-12-31' }),
        domainBuilder.buildCreditsLotBalance({ id: 2, expirationDate: '2021-01-01' }),
        domainBuilder.buildCreditsLotBalance({ id: 3, expirationDate: '2100-01-01' }),
      ];

      // when
      const activeCredits = new ActiveCredits(lots);

      // then
      expect(activeCredits.lotIds).to.deep.equal([3, 1]);
    });
  });

  describe('when a lot was loaded without its consumed count', function () {
    it('throws rather than treating it as empty', function () {
      // given
      const notCounted = new CreditsLotBalance({
        id: 7,
        count: 10,
        activationDate: '2020-01-01',
        expirationDate: '2999-12-31',
      });

      // when
      const error = catchErrSync(() => new ActiveCredits([notCounted]))();

      // then
      expect(error.message).to.equal('Le lot 7 a été chargé sans son nombre de crédits consommés.');
    });
  });
});
