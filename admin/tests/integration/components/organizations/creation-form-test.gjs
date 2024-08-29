import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CreationForm from 'pix-admin/components/organizations/creation-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);
  const onSubmit = () => {};
  const onCancel = () => {};

  test('it renders', async function (assert) {
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization', { type: '' });

    // when
    const screen = await render(
      <template>
        <CreationForm @organization={{organization}} @onSubmit={{onSubmit}} @onCancel={{onCancel}} />
      </template>,
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
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { type: '' });

      // given
      const screen = await render(
        <template>
          <CreationForm @organization={{organization}} @onSubmit={{onSubmit}} @onCancel={{onCancel}} />
        </template>,
      );

      // when
      await click(screen.getByText("Sélectionner un type d'organisation"));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement scolaire' }));

      // then
      assert.strictEqual(organization.type, 'SCO');
    });
  });

  test('Adds data protection officer information', async function (assert) {
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization', { type: '' });

    // given
    await render(
      <template>
        <CreationForm @organization={{organization}} @onSubmit={{onSubmit}} @onCancel={{onCancel}} />
      </template>,
    );

    // when
    await fillByLabel('Prénom du DPO', 'Justin');
    await fillByLabel('Nom du DPO', 'Ptipeu');
    await fillByLabel('Adresse e-mail du DPO', 'justin.ptipeu@example.net');

    // then
    assert.strictEqual(organization.dataProtectionOfficerFirstName, 'Justin');
    assert.strictEqual(organization.dataProtectionOfficerLastName, 'Ptipeu');
    assert.strictEqual(organization.dataProtectionOfficerEmail, 'justin.ptipeu@example.net');
  });

  test('Credits can be added', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization', { type: '' });

    //when
    await render(
      <template>
        <CreationForm @organization={{organization}} @onSubmit={{onSubmit}} @onCancel={{onCancel}} />
      </template>,
    );

    // when
    await fillByLabel('Crédits', 120);

    // then
    assert.strictEqual(organization.credit, 120);
  });
});
