import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | users | user-detail-personal-information', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:users/user-detail-personal-information');
    component.notifications = {
      success: sinon.stub(),
      error: sinon.stub(),
    };
  });

  module('#dissociate', function (hooks) {
    let organizationLearner;

    hooks.beforeEach(function () {
      organizationLearner = {
        id: 1,
        destroyRecord: sinon.stub(),
      };
    });

    test('it should call destroy on model organization-learner', async function (assert) {
      // given
      component.toggleDisplayDissociateModal(organizationLearner);

      // when
      await component.dissociate(organizationLearner);

      // then
      assert.ok(organizationLearner.destroyRecord.called);
      assert.ok(component.notifications.success.called);
    });

    test('it should notify an error if destroyRecord fail', async function (assert) {
      // given
      organizationLearner.destroyRecord.rejects();

      // when
      await component.dissociate(organizationLearner);

      // then
      assert.ok(component.notifications.error.called);
    });
  });
});
