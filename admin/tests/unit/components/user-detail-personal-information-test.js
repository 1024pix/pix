import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';

module('Unit | Component | user-detail-personal-information', function(hooks) {

  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:user-detail-personal-information');
  });

  test('it should generate dashboard URL based on environment and object', async function(assert) {
    // given
    const args = { user: { id: 1 } };
    const baseUrl = 'https://metabase.pix.fr/dashboard/132?id=';
    const expectedUrl = baseUrl + args.user.id;

    ENV.APP.USER_DASHBOARD_URL = baseUrl;
    component.args = args;

    // when
    const actualUrl = component.externalURL;

    // then
    assert.equal(actualUrl, expectedUrl);
  });

});
