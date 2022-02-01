import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/campaigns/campaign/profile-results', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/profile-results');
  });

  module('triggerFiltering', function () {
    test('update the divisions', function (assert) {
      const fetchCampaign = sinon.stub();
      controller.set('fetchCampaign', fetchCampaign);
      controller.set('model', { id: 12 });
      controller.set('pageNumber', 11);

      controller.triggerFiltering({ divisions: ['6eme'] });

      assert.deepEqual(controller.divisions, ['6eme']);
      assert.deepEqual(controller.pageNumber, null);
    });

    test('update the groups', function (assert) {
      const fetchCampaign = sinon.stub();
      controller.set('fetchCampaign', fetchCampaign);
      controller.set('model', { id: 12 });

      controller.triggerFiltering({ groups: ['M2'] });

      assert.deepEqual(controller.groups, ['M2']);
    });
  });

  module('resetFiltering', function () {
    test('reset params', function (assert) {
      //given
      controller.set('pageNumber', 1);
      controller.set('divisions', ['3eme']);
      controller.set('groups', ['M2']);

      //when
      controller.resetFiltering();

      //then
      assert.deepEqual(controller.divisions, []);
      assert.deepEqual(controller.groups, []);
      assert.deepEqual(controller.pageNumber, null);
    });
  });

  module('#action goToProfilePage', function () {
    test('it should call transitionToRoute with appropriate arguments', function (assert) {
      // given
      const event = {
        stopPropagation: sinon.stub(),
        preventDefault: sinon.stub(),
      };

      controller.transitionToRoute = sinon.stub();

      // when
      controller.send('goToProfilePage', 123, 345, event);

      // then
      assert.true(event.stopPropagation.called);
      assert.true(event.preventDefault.called);
      assert.true(controller.transitionToRoute.calledWith('authenticated.campaigns.participant-profile', 123, 345));
    });
  });
});
