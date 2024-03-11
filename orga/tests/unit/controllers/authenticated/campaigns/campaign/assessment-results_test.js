import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/campaigns/campaign/assessment-results', function (hooks) {
  setupTest(hooks);
  let controller;
  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/assessment-results');
  });

  module('#triggerFiltering', function () {
    module('when the filters contain a valued field', function () {
      test('updates the value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', 'new-value');

        // then
        assert.strictEqual(controller.someField, 'new-value');
      });
    });

    module('when the filters contain an empty string', function () {
      test('clear the searched value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', '');

        // then
        assert.strictEqual(controller.someField, undefined);
      });
    });
  });

  module('#resetFiltering', function () {
    test('reset the filters', function (assert) {
      //given
      controller.set('pageNumber', 1);
      controller.set('divisions', ['3eme']);
      controller.set('groups', ['L1']);
      controller.set('badges', ['badge1']);
      controller.set('stages', ['stage1']);
      controller.set('search', 'dam');

      //when
      controller.resetFiltering();

      //then
      assert.deepEqual(controller.pageNumber, null);
      assert.deepEqual(controller.search, null);
      assert.deepEqual(controller.divisions, []);
      assert.deepEqual(controller.groups, []);
      assert.deepEqual(controller.badges, []);
      assert.deepEqual(controller.stages, []);
    });
  });

  module('#filterByStage', function () {
    test('set the stage filter', function (assert) {
      // given
      controller.filterByStage(123);
      // then
      assert.deepEqual(controller.stages, ['123']);
    });
  });

  module('#goToAssessmentPage', function () {
    test('it should call transitionTo with appropriate arguments', function (assert) {
      // given
      const event = {
        stopPropagation: sinon.stub(),
        preventDefault: sinon.stub(),
      };

      controller.router.transitionTo = sinon.stub();

      // when
      controller.send('goToAssessmentPage', 123, 345, event);

      // then
      assert.true(event.stopPropagation.called);
      assert.true(event.preventDefault.called);
      assert.true(
        controller.router.transitionTo.calledWith('authenticated.campaigns.participant-assessment', 123, 345),
      );
    });
  });
});
