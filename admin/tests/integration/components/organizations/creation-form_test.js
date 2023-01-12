import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillByLabel } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | organizations/creation-form', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.onSubmit = () => {};
    this.onCancel = () => {};
    const store = this.owner.lookup('service:store');
    this.organization = store.createRecord('organization', { type: '' });
  });

  test('it renders', async function (assert) {
    // when
    const screen = await render(
      hbs`<Organizations::CreationForm @organization={{this.organization}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
    );

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Nom' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Lien vers la documentation' })).exists();
    assert.dom(screen.getByText("Sélectionner un type d'organisation")).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Ajouter' })).exists();
  });

  module('#selectOrganizationType', function () {
    test('should update attribute organization.type', async function (assert) {
      // given
      const screen = await render(
        hbs`<Organizations::CreationForm @organization={{this.organization}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
      );

      // when
      await click(screen.getByText("Sélectionner un type d'organisation"));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement scolaire' }));

      // then
      assert.strictEqual(this.organization.type, 'SCO');
    });
  });

  test('Adds data protection officer information', async function (assert) {
    // given
    await render(
      hbs`<Organizations::CreationForm @organization={{this.organization}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
    );

    // when
    await fillByLabel('Prénom du DPO', 'Justin');
    await fillByLabel('Nom du DPO', 'Ptipeu');
    await fillByLabel('Adresse e-mail du DPO', 'justin.ptipeu@example.net');

    // then
    assert.strictEqual(this.organization.dataProtectionOfficerFirstName, 'Justin');
    assert.strictEqual(this.organization.dataProtectionOfficerLastName, 'Ptipeu');
    assert.strictEqual(this.organization.dataProtectionOfficerEmail, 'justin.ptipeu@example.net');
  });

  test('Credits can be added', async function (assert) {
    // given
    await render(
      hbs`<Organizations::CreationForm @organization={{this.organization}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
    );

    // when
    await fillByLabel('Crédits', 120);

    // then
    assert.strictEqual(this.organization.credit, 120);
  });
});
