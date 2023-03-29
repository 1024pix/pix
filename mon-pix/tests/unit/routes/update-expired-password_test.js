import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupTest } from 'ember-qunit';

import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Unit | Route | update-expired-password', function (hooks) {
  setupTest(hooks);

  test('should retrieve a reset expired password demand', async function (assert) {
    // given
    const route = this.owner.lookup('route:update-expired-password');
    const peekAllStub = sinon.stub();
    const storeStub = Service.create({
      peekAll: peekAllStub,
    });
    route.set('store', storeStub);

    const resetExpiredPasswordDemand = EmberObject.create({ username: 'user.name0112', oneTimePassword: 'password' });
    peekAllStub.returns([resetExpiredPasswordDemand]);

    // when
    const model = await route.model();

    // then
    assert.strictEqual(model, resetExpiredPasswordDemand);
  });
});
