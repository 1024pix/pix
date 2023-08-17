import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Table | Pagination Control', function (hooks) {
  setupTest(hooks);

  module('#changePageSize', function () {
    test('should call onChange', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const component = await createGlimmerComponent('component:table/pagination-control', {
        onChange: sinon.stub(),
      });

      // when
      await component.changePageSize();

      // then
      sinon.assert.calledOnce(component.args.onChange);
      assert.ok(true);
    });

    test('should not throw an error', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const component = await createGlimmerComponent('component:table/pagination-control', {
        onChange: null,
      });

      // when
      await component.changePageSize();

      // then
      assert.ok(true);
    });
  });

  module('#goToNextPage', function () {
    test('should call onChange', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const component = await createGlimmerComponent('component:table/pagination-control', {
        onChange: sinon.stub(),
      });

      // when
      await component.goToNextPage();

      // then
      sinon.assert.calledOnce(component.args.onChange);
      assert.ok(true);
    });

    test('should not throw an error', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const component = await createGlimmerComponent('component:table/pagination-control', {
        onChange: null,
      });

      // when
      await component.goToNextPage();

      // then
      assert.ok(true);
    });
  });

  module('#goToPreviousPage', function () {
    test('should call onChange', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const component = await createGlimmerComponent('component:table/pagination-control', {
        onChange: sinon.stub(),
      });

      // when
      await component.goToPreviousPage();

      // then
      sinon.assert.calledOnce(component.args.onChange);
      assert.ok(true);
    });

    test('should not throw an error', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const component = await createGlimmerComponent('component:table/pagination-control', {
        onChange: null,
      });

      // when
      await component.goToPreviousPage();

      // then
      assert.ok(true);
    });
  });
});
