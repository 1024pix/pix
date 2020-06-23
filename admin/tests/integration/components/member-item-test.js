import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | member-item', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    const user = EmberObject.create({ firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });
    this.membership = EmberObject.create({ id: 1, user, displayedOrganizationRole: 'Administrateur', save: () => {} });
  });

  test('it should display a member', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{this.membership}} />`);

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
    await render(hbs`<MemberItem @membership={{this.membership}} />`);
    await click('button[aria-label="Modifier le rôle"]');

    // then
    assert.contains('Enregistrer');
    assert.dom('button[aria-label="Annuler"]');
  });

  test('it should display the options when select is open', async function(assert) {
    // when
    await render(hbs`<MemberItem @membership={{this.membership}} />`);
    await click('button[aria-label="Modifier le rôle"]');
    await click('.ember-power-select-trigger');

    // then
    assert.contains('Membre');
    assert.contains('Administrateur');
  });

  test('it should update role on save', async function(assert) {
    // given
    this.updateMembership = sinon.spy();

    // when
    await render(hbs`<MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`);
    await click('button[aria-label="Modifier le rôle"]');
    await selectChoose('.editable-cell', 'Membre');
    await click('button[aria-label="Enregistrer"]');

    // then
    assert.notContains('Enregistrer');
    assert.equal(this.membership.organizationRole, 'MEMBER');
    assert.ok(this.updateMembership.called);
  });

  test('it should not update role on cancel', async function(assert) {
    // given
    this.updateMembership = sinon.spy();

    // when
    await render(hbs`<MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`);
    await click('button[aria-label="Modifier le rôle"]');
    await selectChoose('.editable-cell', 'Membre');
    await click('button[aria-label="Annuler"]');

    // then
    assert.contains('Administrateur');
    assert.notContains('Enregistrer');
    assert.notOk(this.updateMembership.called);
  });
});
