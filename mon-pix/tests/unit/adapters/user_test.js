import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | user', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:user');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#queryRecord', function () {
    test('should build /me url', async function (assert) {
      // when
      const url = await adapter.urlForQueryRecord({ me: true }, 'user');

      // then
      assert.true(url.endsWith('/users/me'));
    });

    test('should build classic url', async function (assert) {
      // when
      const url = await adapter.urlForQueryRecord({}, 'user');

      // then
      assert.true(url.endsWith('/users'));
    });
  });

  module('#urlForUpdateRecord', function () {
    test('should redirect to /api/users/{id}/pix-terms-of-service-acceptance', async function (assert) {
      // when
      const snapshot = { adapterOptions: { acceptPixTermsOfService: true } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.true(url.endsWith('/users/123/pix-terms-of-service-acceptance'));
    });

    test('should build update url from user id', async function (assert) {
      // when
      const snapshot = { adapterOptions: {} };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.true(url.endsWith('/users/123'));
    });

    test('should redirect to remember-user-has-seen-assessment-instructions', async function (assert) {
      // when
      const snapshot = { adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.true(url.endsWith('/users/123/remember-user-has-seen-assessment-instructions'));
    });

    test('should redirect to has-seen-last-data-protection-policy-information', async function (assert) {
      // when
      const snapshot = { adapterOptions: { rememberUserHasSeenLastDataProtectionPolicyInformation: true } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.true(url.endsWith('/users/123/has-seen-last-data-protection-policy-information'));
    });

    test('should redirect to has-seen-challenge-tooltip', async function (assert) {
      // when
      const snapshot = { adapterOptions: { tooltipChallengeType: 'focused' } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.true(url.endsWith('/users/123/has-seen-challenge-tooltip/focused'));
    });

    test('should include temporaryKey if present in adapterOptions', async function (assert) {
      // when
      const snapshot = { adapterOptions: { updatePassword: true, temporaryKey: 'temp=&key' } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.true(url.endsWith('/users/123/password-update?temporary-key=temp%3D%26key'));
    });

    test('should redirect to lang', async function (assert) {
      // when
      const options = { adapterOptions: { lang: 'en' } };
      const url = await adapter.urlForUpdateRecord(123, 'user', options);

      // then
      assert.true(url.endsWith('/users/123/lang/en'));
    });
  });

  module('#createRecord', function () {
    module('when campaignCode adapterOption is defined', function () {
      test('should add campaign-code meta', async function (assert) {
        // given
        const campaignCode = 'AZERTY123';
        const expectedUrl = 'http://localhost:3000/api/users';
        const expectedMethod = 'POST';
        const expectedData = {
          data: {
            meta: { 'campaign-code': campaignCode },
            data: {},
          },
        };
        const snapshot = {
          record: {},
          adapterOptions: { campaignCode },
          serialize: function () {
            return { data: {} };
          },
        };

        // when
        await adapter.createRecord(null, { modelName: 'user' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
        assert.ok(true);
      });
    });
  });
});
