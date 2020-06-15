import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';

module('Unit | Component | organization-information-section', function(hooks) {

  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:organization-information-section');
  });

  test('it exists', function(assert) {
    assert.ok(component);
  });

  test('it should generate link based on environment and object', async function(assert) {
    // given
    const args = { organization: { id: 1 } };
    const baseUrl = 'https://metabase.pix.fr/dashboard/137/?id=';
    const expectedURL = baseUrl + args.organization.id;

    ENV.APP.ORGANIZATION_DASHBOARD_URL = baseUrl;
    component.args = args;

    // when
    const actualUrl = component.externalURL;
    // then
    assert.equal(actualUrl, expectedURL);
  });

});
