import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import Service from '@ember/service';
import { setupTest } from 'ember-mocha';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

describe('Unit | Route | account-recovery | update sco record', function () {
  setupTest();
  setupIntl();

  describe('Route behavior', function () {
    let storeStub;
    let queryRecordStub;
    const params = {
      temporary_key: 'temporary key',
    };

    beforeEach(function () {
      queryRecordStub = sinon.stub();
      storeStub = Service.create({
        queryRecord: queryRecordStub,
      });
    });

    it('should exist', function () {
      // when
      const route = this.owner.lookup('route:account-recovery/update-sco-record');
      route.set('store', storeStub);

      // then
      expect(route).to.be.ok;
    });

    it('should get valid account recovery', function () {
      // given
      queryRecordStub.resolves({});
      const route = this.owner.lookup('route:account-recovery/update-sco-record');
      route.set('store', storeStub);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'account-recovery-demand', {
          temporaryKey: params.temporary_key,
        });
      });
    });

    describe('when account recovery demand is valid', function () {
      it('should create account recovery demand with fetched data', function () {
        // given
        const stubbedAccountRecoveryDetails = {
          email: 'philipe@example.net',
          firstName: 'philippe',
        };
        const expectedAccountRecoveryDetails = {
          email: 'philipe@example.net',
          firstName: 'philippe',
        };

        queryRecordStub.resolves(stubbedAccountRecoveryDetails);
        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then(({ temporaryKey, ...accountRecoveryDetails }) => {
          expect(accountRecoveryDetails).to.eql(expectedAccountRecoveryDetails);
          expect(temporaryKey).to.eql(params.temporary_key);
        });
      });
    });

    describe('when account recovery demand is invalid ', function () {
      ['400', '404'].forEach((statusCode) => {
        it(`should return error message when account recovery fails with ${statusCode}`, function () {
          // given
          queryRecordStub.rejects({ errors: [{ status: statusCode }] });

          const route = this.owner.lookup('route:account-recovery/update-sco-record');
          route.set('store', storeStub);

          // when
          const promise = route.model(params);

          // then
          return promise.then((result) => {
            expect(result.errorMessage).to.equal(this.intl.t('pages.account-recovery.errors.key-invalid'));
            expect(result.showBackToHomeButton).to.be.true;
          });
        });
      });

      it('should return error message when account recovery fails with 401', function () {
        // given
        queryRecordStub.rejects({ errors: [{ status: 401 }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then((result) => {
          expect(result.errorMessage).to.equal(this.intl.t('pages.account-recovery.errors.key-expired'));
          expect(result.showRenewLink).to.be.true;
        });
      });

      it('should return error message when account recovery fails with 400 and ACCOUNT_WITH_EMAIL_ALREADY_EXISTS', function () {
        // given
        queryRecordStub.rejects({ errors: [{ status: 400, code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then((result) => {
          expect(result.errorMessage).to.equal(this.intl.t('pages.account-recovery.errors.account-exists'));
          expect(result.showBackToHomeButton).to.be.true;
        });
      });

      it('should return error message when account recovery fails with 403', function () {
        // given
        queryRecordStub.rejects({ errors: [{ status: 403 }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then((result) => {
          expect(result.errorMessage).to.equal(this.intl.t('pages.account-recovery.errors.key-used'));
          expect(result.showBackToHomeButton).to.be.true;
        });
      });

      ['500', '502', '504'].forEach((statusCode) => {
        it(`should return error message when account recovery fails with ${statusCode}`, function () {
          // given
          queryRecordStub.rejects({ errors: [{ status: statusCode }] });

          const route = this.owner.lookup('route:account-recovery/update-sco-record');
          route.set('store', storeStub);

          // when
          const promise = route.model(params);

          // then
          return promise.then((result) => {
            expect(result.errorMessage).to.equal(this.intl.t('api-error-messages.internal-server-error'));
            expect(result.showBackToHomeButton).to.be.true;
          });
        });
      });
    });
  });
});
