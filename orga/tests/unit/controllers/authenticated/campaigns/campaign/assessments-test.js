import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/campaigns/campaign/assessments', function(hooks) {
  setupTest(hooks);
  let controller;
  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/assessments');
  });

  module('triggerFiltering', function() {
    module('division filter', function() {
      test('update the division filter', function(assert) {
        // given
        controller.triggerFiltering({ divisions: ['6eme'] });
        // then
        assert.deepEqual(controller.divisions, ['6eme']);
      });

      test('should keep other filters when division is updated', function(assert) {
        // when
        controller.set('badges', ['badge1']);
        // given
        controller.triggerFiltering({ divisions: ['6eme'] });
        // then
        assert.deepEqual(controller.badges, ['badge1']);
      });
    });

    module('badge filter', function() {
      test('update the badge filter', function(assert) {
        // given
        controller.triggerFiltering({ badges: ['badge1'] });
        // then
        assert.deepEqual(controller.badges, ['badge1']);
      });

      test('should keep other filters when is badge updated', function(assert) {
        // when
        controller.set('divisions', ['division1']);
        // given
        controller.triggerFiltering({ badges: ['badge1'] });
        // then
        assert.deepEqual(controller.divisions, ['division1']);
      });
    });

    module('stage filter', function() {
      test('update the stage filter', function(assert) {
        // given
        controller.triggerFiltering({ stages: ['stage1'] });
        // then
        assert.deepEqual(controller.stages, ['stage1']);
      });

      test('should keep other filters when is stage updated', function(assert) {
        // when
        controller.set('divisions', ['division1']);
        // given
        controller.triggerFiltering({ stages: ['stage1'] });
        // then
        assert.deepEqual(controller.divisions, ['division1']);
      });
    });
  });
});
