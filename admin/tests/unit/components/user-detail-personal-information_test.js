import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';
import sinon from 'sinon';

module('Unit | Component | user-detail-personal-information', function(hooks) {

  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:user-detail-personal-information');
    component.notifications = {
      success: sinon.stub(),
      error: sinon.stub(),
    };
  });

  test('it should generate dashboard URL based on environment and object', async function(assert) {
    // given
    const args = {
      user: {
        id: 1,
      },
    };
    const baseUrl = 'https://metabase.pix.fr/dashboard/132?id=';
    const expectedUrl = baseUrl + args.user.id;

    ENV.APP.USER_DASHBOARD_URL = baseUrl;
    component.args = args;

    // when
    const actualUrl = component.externalURL;

    // then
    assert.equal(actualUrl, expectedUrl);
  });

  module('#dissociate', function(hooks) {

    let schoolingRegistration;

    hooks.beforeEach(function() {
      schoolingRegistration = {
        id: 1,
        destroyRecord: sinon.stub(),
      };
    });

    test('it should call destroy on model schooling-registration', async function(assert) {
      // given
      component.toggleDisplayDissociateModal(schoolingRegistration);

      // when
      await component.dissociate(schoolingRegistration);

      // then
      assert.ok(schoolingRegistration.destroyRecord.called);
      assert.ok(component.notifications.success.called);
    });

    test('it should notify an error if destroyRecord fail', async function(assert) {
      // given
      schoolingRegistration.destroyRecord.rejects();

      // when
      await component.dissociate(schoolingRegistration);

      // then
      assert.ok(component.notifications.error.called);
    });
  });

});
