import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | sessions | index ', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:sessions');
  });

  module('#displayNoSessionPanel', function () {
    module('when there are sessions', function () {
      test('should return false', async function (assert) {
        // given
        component.args.sessionSummaries = { meta: { hasSessions: true } };

        // when
        const displayNoSessionPanel = component.displayNoSessionPanel;

        // then
        assert.false(displayNoSessionPanel);
      });
    });

    module('when there are no sessions', function () {
      test('should return true', async function (assert) {
        // given
        component.args.sessionSummaries = { meta: { hasSessions: false } };

        // when
        const displayNoSessionPanel = component.displayNoSessionPanel;

        // then
        assert.true(displayNoSessionPanel);
      });
    });
  });
});
