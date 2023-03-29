import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | changer mot de passe', function (hooks) {
  setupTest(hooks);

  module('Route behavior', function (hooks) {
    let storeStub;
    let queryRecordStub;
    const params = {
      temporary_key: 'pwd-reset-demand-token',
    };

    hooks.beforeEach(function () {
      queryRecordStub = sinon.stub();
      storeStub = Service.create({
        queryRecord: queryRecordStub,
      });
    });

    test('should exists', function (assert) {
      // when
      const route = this.owner.lookup('route:reset-password');
      route.set('store', storeStub);

      // then
      assert.ok(route);
    });

    test('should ask password reset demand validity', async function (assert) {
      // given
      queryRecordStub.resolves();
      const route = this.owner.lookup('route:reset-password');
      route.set('store', storeStub);

      // when
      await route.model(params);

      // then
      sinon.assert.calledOnce(queryRecordStub);
      sinon.assert.calledWith(queryRecordStub, 'user', {
        passwordResetTemporaryKey: params.temporary_key,
      });
      assert.ok(true);
    });

    module('when password reset demand is valid', function () {
      test('should create a new ember user model with fetched data', async function (assert) {
        // given
        const fetchedOwnerDetails = {
          data: {
            id: 7,
            attributes: {
              email: 'pix@qmail.fr',
            },
          },
        };
        const expectedUser = {
          data: {
            id: 7,
            attributes: {
              email: 'pix@qmail.fr',
            },
          },
        };

        queryRecordStub.resolves(fetchedOwnerDetails);
        const route = this.owner.lookup('route:reset-password');
        route.set('store', storeStub);

        // when
        const result = await route.model(params);

        // then
        assert.deepEqual(result.user, expectedUser);
        assert.deepEqual(result.temporaryKey, params.temporary_key);
      });
    });
  });
});
