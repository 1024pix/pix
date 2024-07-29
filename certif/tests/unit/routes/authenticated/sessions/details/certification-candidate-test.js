import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import pick from 'lodash/pick';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/details/certification-candidates', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/sessions/details/certification-candidates');
  });

  module('#model', function (hooks) {
    const session = Symbol('session');
    const countries = Symbol('countries');
    const details = EmberObject.create({ session });

    hooks.beforeEach(function () {
      route.modelFor = sinon.stub().returns(details);
      route.store.findAll = sinon.stub().returns(countries);
    });

    test('it should return the expectedModel', async function (assert) {
      // given
      const expectedModel = { session, countries };

      // when
      const actualModel = await route.model();

      // then
      sinon.assert.calledWith(route.modelFor, 'authenticated.sessions.details');
      sinon.assert.calledWith(route.store.findAll, 'country');
      assert.deepEqual(pick(actualModel, ['session', 'countries']), expectedModel);
    });
  });
});
