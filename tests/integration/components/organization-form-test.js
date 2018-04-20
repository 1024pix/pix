import { module, test, only } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Integration | Component | organization-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{organization-form}}`);

    // then
    assert.dom('.organization-form').exists();
  });

/*
  module('#submitOrganization', function(hooks) {

    only('', async function(assert) {
      // given
      this.set();
      await render(hbs`{{organization-form}}`);
      await fillIn('#organizationName', '');

      // when
      await click('.form-action--submit');

      // then

    });
  });
*/

  module('#selectOrganizationType', function(hooks) {

    test('should update attribute organization.type', async function(assert) {
      // given
      let selectedOrganizationType = null;
      let  organization = EmberObject.create({ type: null });
      this.set('selectedOrganizationType',selectedOrganizationType);
      this.set('organization', organization);
      await render(hbs`{{organization-form selectedOrganizationType=selectedOrganizationType organization=organization}}`);

      // when
      await selectChoose('#organizationTypeSelector', 'Établissement scolaire');

      // then
      assert.equal(this.get('selectedOrganizationType.value'), 'SCO');
      assert.equal(this.get('organization.type'), 'SCO');
    });
  });

});
