import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certification-centers/get/attached-organizations', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/certification-centers/get/attached-organizations');
  });

  module('#model', function () {
    test('it queries an attached-organization store model with the certificationId parameter from the parent route and returns it', async function (assert) {
      // given
      const organizations = [{ id: '1', name: 'Orga' }];
      const certificationCenter = { id: '17' };
      route.modelFor = sinon.stub().returns({ certificationCenter });
      route.store = { query: sinon.stub().resolves(organizations) };

      // when
      const result = await route.model();

      // then
      sinon.assert.calledWith(route.store.query, 'attached-organization', { certificationCenterId: '17' });
      assert.strictEqual(result, organizations);
    });
  });
});
