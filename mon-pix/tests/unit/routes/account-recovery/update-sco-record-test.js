import { module, test } from 'qunit';
import sinon from 'sinon';

import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

module('Unit | Route | account-recovery | update sco record', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('Route behavior', function (hooks) {
    let storeStub;
    let queryRecordStub;
    const params = {
      temporary_key: 'temporary key',
    };

    hooks.beforeEach(function () {
      queryRecordStub = sinon.stub();
      storeStub = Service.create({
        queryRecord: queryRecordStub,
      });
    });

    test('should exist', function (assert) {
      // when
      const route = this.owner.lookup('route:account-recovery/update-sco-record');
      route.set('store', storeStub);

      // then
      assert.ok(route);
    });

    test('should get valid account recovery', function (assert) {
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
        assert.ok(true);
      });
    });

    module('when account recovery demand is valid', function () {
      test('should create account recovery demand with fetched data', function (assert) {
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
          assert.deepEqual(accountRecoveryDetails, expectedAccountRecoveryDetails);
          assert.deepEqual(temporaryKey, params.temporary_key);
        });
      });
    });

    module('when account recovery demand is invalid ', function () {
      ['400', '404'].forEach((statusCode) => {
        test(`should return error message when account recovery fails with ${statusCode}`, function (assert) {
          // given
          queryRecordStub.rejects({ errors: [{ status: statusCode }] });

          const route = this.owner.lookup('route:account-recovery/update-sco-record');
          route.set('store', storeStub);

          // when
          const promise = route.model(params);

          // then
          return promise.then((result) => {
            assert.equal(result.errorMessage, this.intl.t('pages.account-recovery.errors.key-invalid'));
            assert.equal(result.showBackToHomeButton, true);
          });
        });
      });

      test('should return error message when account recovery fails with 401', function (assert) {
        // given
        queryRecordStub.rejects({ errors: [{ status: 401 }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then((result) => {
          assert.equal(result.errorMessage, this.intl.t('pages.account-recovery.errors.key-expired'));
          assert.equal(result.showRenewLink, true);
        });
      });

      test('should return error message when account recovery fails with 400 and ACCOUNT_WITH_EMAIL_ALREADY_EXISTS', function (assert) {
        // given
        queryRecordStub.rejects({ errors: [{ status: 400, code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then((result) => {
          assert.equal(result.errorMessage, this.intl.t('pages.account-recovery.errors.account-exists'));
          assert.equal(result.showBackToHomeButton, true);
        });
      });

      test('should return error message when account recovery fails with 403', function (assert) {
        // given
        queryRecordStub.rejects({ errors: [{ status: 403 }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then((result) => {
          assert.equal(result.errorMessage, this.intl.t('pages.account-recovery.errors.key-used'));
          assert.equal(result.showBackToHomeButton, true);
        });
      });

      ['500', '502', '504'].forEach((statusCode) => {
        test(`should return error message when account recovery fails with ${statusCode}`, function (assert) {
          // given
          queryRecordStub.rejects({ errors: [{ status: statusCode }] });

          const route = this.owner.lookup('route:account-recovery/update-sco-record');
          route.set('store', storeStub);

          // when
          const promise = route.model(params);

          // then
          return promise.then((result) => {
            assert.equal(result.errorMessage, this.intl.t('api-error-messages.internal-server-error'));
            assert.equal(result.showBackToHomeButton, true);
          });
        });
      });
    });
  });
});
