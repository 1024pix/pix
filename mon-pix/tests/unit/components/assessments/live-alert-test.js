import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Assessments | Live alert', function (hooks) {
  setupTest(hooks);

  module('#refreshPage', function () {
    test('should refresh page', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'refresh');
      const component = createGlimmerComponent('assessments/live-alert');

      // when
      await component.refreshPage();

      // then
      sinon.assert.calledOnce(component.router.refresh);
      assert.ok(true);
    });
  });
});
