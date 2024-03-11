import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/campaigns/campaign/profile-results', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/profile-results');
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
    test('reset params', function (assert) {
      //given
      controller.set('pageNumber', 1);
      controller.set('divisions', ['3eme']);
      controller.set('groups', ['M2']);
      controller.set('search', 'fra');

      //when
      controller.resetFiltering();

      //then
      assert.deepEqual(controller.divisions, []);
      assert.deepEqual(controller.groups, []);
      assert.deepEqual(controller.search, null);
      assert.deepEqual(controller.pageNumber, null);
    });
  });

  module('#goToProfilePage', function () {
    test('it should call transitionTo with appropriate arguments', function (assert) {
      const routerService = this.owner.lookup('service:router');
      // given
      const event = {
        stopPropagation: sinon.stub(),
        preventDefault: sinon.stub(),
      };

      routerService.transitionTo = sinon.stub();

      // when
      controller.send('goToProfilePage', 123, 345, event);

      // then
      assert.true(event.stopPropagation.called);
      assert.true(event.preventDefault.called);
      assert.true(controller.router.transitionTo.calledWith('authenticated.campaigns.participant-profile', 123, 345));
    });
  });
});
