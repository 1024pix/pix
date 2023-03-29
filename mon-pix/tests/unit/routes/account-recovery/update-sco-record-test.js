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

    test('should get valid account recovery', async function (assert) {
      // given
      queryRecordStub.resolves({});
      const route = this.owner.lookup('route:account-recovery/update-sco-record');
      route.set('store', storeStub);

      // when
      await route.model(params);

      // then

      sinon.assert.calledOnce(queryRecordStub);
      sinon.assert.calledWith(queryRecordStub, 'account-recovery-demand', {
        temporaryKey: params.temporary_key,
      });
      assert.ok(true);
    });

    module('when account recovery demand is valid', function () {
      test('should create account recovery demand with fetched data', async function (assert) {
        // given
        const stubbedAccountRecoveryDetails = {
          email: 'philipe@example.net',
          firstName: 'philippe',
        };

        queryRecordStub.resolves(stubbedAccountRecoveryDetails);
        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const result = await route.model(params);

        // then
        assert.strictEqual(result.email, 'philipe@example.net');
        assert.strictEqual(result.firstName, 'philippe');
        assert.strictEqual(result.temporaryKey, params.temporary_key);
      });
    });

    module('when account recovery demand is invalid ', function () {
      ['400', '404'].forEach((statusCode) => {
        test(`should return error message when account recovery fails with ${statusCode}`, async function (assert) {
          // given
          queryRecordStub.rejects({ errors: [{ status: statusCode }] });

          const route = this.owner.lookup('route:account-recovery/update-sco-record');
          route.set('store', storeStub);

          // when
          const result = await route.model(params);

          // then
          assert.strictEqual(result.errorMessage, this.intl.t('pages.account-recovery.errors.key-invalid'));
          assert.true(result.showBackToHomeButton);
        });
      });

      test('should return error message when account recovery fails with 401', async function (assert) {
        // given
        queryRecordStub.rejects({ errors: [{ status: 401 }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const result = await route.model(params);

        // then
        assert.strictEqual(result.errorMessage, this.intl.t('pages.account-recovery.errors.key-expired'));
        assert.true(result.showRenewLink);
      });

      test('should return error message when account recovery fails with 400 and ACCOUNT_WITH_EMAIL_ALREADY_EXISTS', async function (assert) {
        // given
        queryRecordStub.rejects({ errors: [{ status: 400, code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const result = await route.model(params);

        // then
        assert.strictEqual(result.errorMessage, this.intl.t('pages.account-recovery.errors.account-exists'));
        assert.true(result.showBackToHomeButton);
      });

      test('should return error message when account recovery fails with 403', async function (assert) {
        // given
        queryRecordStub.rejects({ errors: [{ status: 403 }] });

        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const result = await route.model(params);

        // then
        assert.strictEqual(result.errorMessage, this.intl.t('pages.account-recovery.errors.key-used'));
        assert.true(result.showBackToHomeButton);
      });

      ['500', '502', '504'].forEach((statusCode) => {
        test(`should return error message when account recovery fails with ${statusCode}`, async function (assert) {
          // given
          queryRecordStub.rejects({ errors: [{ status: statusCode }] });

          const route = this.owner.lookup('route:account-recovery/update-sco-record');
          route.set('store', storeStub);

          // when
          const result = await route.model(params);

          // then
          assert.strictEqual(result.errorMessage, this.intl.t('common.api-error-messages.internal-server-error'));
          assert.true(result.showBackToHomeButton);
        });
      });
    });
  });
});
