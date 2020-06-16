import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import EmberObject from '@ember/object';

module('Integration | Component | member-item', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    const user = EmberObject.create({ firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });
    const membership = EmberObject.create({ id: 1, user, displayedOrganizationRole: 'Administrateur', save: () => {} });
    this.set('membership', membership);
  });

  test('it should display a member', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{membership}} />`);

    // then
    assert.contains('1');
    assert.contains('Jojo');
    assert.contains('La Gringue');
    assert.contains('jojo@lagringue.fr');
    assert.contains('Administrateur');
    assert.contains('Modifier le rôle');
  });

  test('it should display save and cancel button on click', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{membership}} />`);
    await click('#edit-organization-role');

    // then
    assert.contains('Enregistrer');
    assert.dom('[aria-label="Annuler"]');
  });

  test('it should display the options when select is open', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{membership}} />`);
    await click('#edit-organization-role');
    await click('.ember-power-select-trigger');

    // then
    assert.contains('Membre');
    assert.contains('Administrateur');
  });

  test('it should set selected value', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{membership}} />`);
    await click('#edit-organization-role');
    await selectChoose('.editable-cell', 'Membre');

    // then
    assert.contains('Membre');
  });

  test('it should update role on save', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{membership}} />`);
    await click('#edit-organization-role');
    await selectChoose('.editable-cell', 'Membre');
    await click('#save-organization-role');

    // then
    assert.notContains('Enregistrer');
  });

  test('it should not update role on cancel', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{membership}} />`);
    await click('#edit-organization-role');
    await selectChoose('.editable-cell', 'Membre');
    await click('#cancel-update-organization-role');

    // then
    assert.contains('Administrateur');
    assert.notContains('Enregistrer');
  });
});
