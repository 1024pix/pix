import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | organizations/information-section-edit', function (hooks) {
  setupTest(hooks);

  module('when None is selected as SSO', function () {
    test('it should set identityProviderForCampaigns to null', async function (assert) {
      // given
      const component = createGlimmerComponent('component:organizations/information-section-edit', {
        organization: { id: 1 },
      });
      const target = { selectedIndex: 0, options: { 0: { value: 'None' } } };
      const eventOnChange = { target };

      // when
      component.onChangeIdentityProvider(eventOnChange);

      // then
      assert.strictEqual(component.form.identityProviderForCampaigns, null);
    });
  });
});
