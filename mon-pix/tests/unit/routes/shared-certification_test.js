import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | shared-certification', function (hooks) {
  setupTest(hooks);

  test('should redirect if there a no data (direct access)', function (assert) {
    const route = this.owner.lookup('route:shared-certification');
    sinon.stub(route.router, 'replaceWith');

    route.redirect({}, {});
    assert.expect(0);
    sinon.assert.calledWithExactly(route.router.replaceWith, '/verification-certificat?unallowedAccess=true');
  });

  test('should not redirect with certification', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('certification', {});

    const route = this.owner.lookup('route:shared-certification');
    sinon.stub(route.router, 'replaceWith');

    route.redirect(model, {});
    assert.expect(0);
    sinon.assert.notCalled(route.router.replaceWith);
  });
});
