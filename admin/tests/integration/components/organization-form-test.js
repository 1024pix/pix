import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Integration | Component | organization-form', function(hooks) {

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.onSubmit = () => {};
    this.onCancel = () => {};
    this.organization = EmberObject.create();
  });

  test('it renders', async function(assert) {
    // when
    await render(hbs`<OrganizationForm @organization={{this.organization}} @onSubmit={{action onSubmit}} @onCancel={{action onCancel}} />`);

    // then
    assert.dom('.organization-form').exists();
  });

  module('#selectOrganizationType', function() {

    test('should update attribute organization.type', async function(assert) {
      // given
      await render(hbs`<OrganizationForm @organization={{this.organization}} @onSubmit={{action onSubmit}} @onCancel={{action onCancel}} />`);

      // when
      await selectChoose('#organizationTypeSelector', 'Établissement scolaire');

      // then
      assert.equal(this.organization.type, 'SCO');
      assert.dom('.ember-power-select-selected-item').hasText('Établissement scolaire');
    });
  });
});
