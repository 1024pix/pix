import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | role-edit', function(hooks) {
  setupRenderingTest(hooks);

  test('it should set selected value', async function(assert) {
    // given
    const record = { organizationRole: 'ADMIN' };
    this.set('record', record);

    // when
    await render(hbs`<RoleEdit @record={{this.record}} />`);

    // then
    assert.dom('.ember-power-select-selected-item').hasText('Administrateur');
  });

  test('it should display the options when select is open', async function(assert) {
    // given
    const record = { organizationRole: 'ADMIN' };
    this.set('record', record);

    // when
    await render(hbs`<RoleEdit @record={{this.record}} />`);
    await click('.ember-power-select-trigger');

    // then
    assert.dom('.ember-power-select-option:nth-child(1)').hasText('Administrateur');
    assert.dom('.ember-power-select-option:nth-child(2)').hasText('Membre');
  });

  test('it should update selected value when another option is selected', async function(assert) {
    // given
    const record = { organizationRole: 'ADMIN' };
    this.set('record', record);

    // when
    await render(hbs`<RoleEdit @record={{this.record}} />`);
    await click('.ember-power-select-trigger');
    await click('.ember-power-select-option:nth-child(2)');

    // then
    assert.dom('.ember-power-select-selected-item').hasText('Membre');
  });
});
