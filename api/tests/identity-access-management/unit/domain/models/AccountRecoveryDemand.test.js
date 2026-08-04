import sinon from 'sinon';

import { AccountRecoveryDemand } from '../../../../../src/identity-access-management/domain/models/AccountRecoveryDemand.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | AccountRecoveryDemand', function () {
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(function () {
    sinon.useFakeTimers({ now });
  });

  describe('#hasExpired', function () {
    describe('when the account recovery demand is expired', function () {
      it('returns true', function () {
        const accountRecoveryDemand = new AccountRecoveryDemand({
          createdAt: new Date('2022-11-27T11:00:00Z'),
        });
        expect(accountRecoveryDemand.hasExpired).to.be.true;
      });
    });

    describe('when the account recovery demand is not expired', function () {
      it('returns false', function () {
        const accountRecoveryDemand = new AccountRecoveryDemand({
          createdAt: new Date('2022-11-28T12:00:00Z'),
        });
        expect(accountRecoveryDemand.hasExpired).to.be.false;
      });
    });
  });
});
