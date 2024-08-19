import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CreationForm from 'pix-admin/components/certification-centers/creation-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-centers/creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the new certification center form component', async function (assert) {
    // given
    const onSubmit = () => {};
    const onCancel = () => {};
    const certificationCenter = {};

    // when
    const screen = await render(
      <template>
        <CreationForm @certificationCenter={{certificationCenter}} @onSubmit={{onSubmit}} @onCancel={{onCancel}} />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Nom du centre')).exists();
    assert.dom(screen.getByText("Type d'établissement")).exists();
    assert.dom(screen.getByText('Identifiant externe')).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByText('Ajouter')).exists();
    assert
      .dom(
        screen.getByRole('checkbox', {
          name: 'Pilote Certification V3 (ce centre de certification ne pourra organiser que des sessions V3)',
        }),
      )
      .exists();
  });

  module('#handleIsV3PilotChange', function () {
    test('should add isV3Pilot to certification center on checked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationCenter = store.createRecord('certification-center');
      const habilitations = [];
      const onSubmit = () => {};
      const onCancel = () => {};

      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @certificationCenter={{certificationCenter}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('checkbox', {
          name: 'Pilote Certification V3 (ce centre de certification ne pourra organiser que des sessions V3)',
        }),
      );

      // then
      assert.true(certificationCenter.isV3Pilot);
    });
  });

  module('#selectCertificationCenterType', function () {
    test('should update attribute certificationCenter.type', async function (assert) {
      // given
      const certificationCenter = {};
      const habilitations = [];
      const onSubmit = () => {};
      const onCancel = () => {};

      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @certificationCenter={{certificationCenter}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: "Type d'établissement" }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement scolaire' }));

      // then
      assert.strictEqual(certificationCenter.type, 'SCO');
    });
  });

  module('#updateGrantedHabilitation', function () {
    test('should add habilitation to certification center on checked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitation1 = store.createRecord('complementary-certification', { key: 'E', label: 'Pix+Edu' });
      const habilitation2 = store.createRecord('complementary-certification', { key: 'S', label: 'Pix+Surf' });
      const certificationCenter = store.createRecord('certification-center');
      const habilitations = [habilitation1, habilitation2];
      const onSubmit = () => {};
      const onCancel = () => {};

      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @certificationCenter={{certificationCenter}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));

      // then
      const expectedHabilitations = await certificationCenter.habilitations;
      assert.ok(expectedHabilitations.includes(habilitation2));
    });

    test('should remove habilitation to certification center on unchecked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitation1 = store.createRecord('complementary-certification', { key: 'E', label: 'Pix+Edu' });
      const habilitation2 = store.createRecord('complementary-certification', { key: 'S', label: 'Pix+Surf' });
      const certificationCenter = store.createRecord('certification-center', {
        habilitations: [habilitation2],
      });
      const habilitations = [habilitation1, habilitation2];
      const onSubmit = () => {};
      const onCancel = () => {};

      const screen = await render(
        <template>
          <CreationForm
            @habilitations={{habilitations}}
            @certificationCenter={{certificationCenter}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));

      // then
      const expectedHabilitations = await certificationCenter.habilitations;
      assert.notOk(expectedHabilitations.includes(habilitation2));
    });
  });

  test('it should be possible to add data protection officer names and email', async function (assert) {
    // given
    const onSubmit = () => {};
    const onCancel = () => {};
    const store = this.owner.lookup('service:store');
    const certificationCenter = store.createRecord('certification-center', { name: 'Super centre' });

    await render(
      <template>
        <CreationForm @certificationCenter={{certificationCenter}} @onSubmit={{onSubmit}} @onCancel={{onCancel}} />
      </template>,
    );

    // when
    await fillByLabel('Prénom du DPO', 'Jacques');
    await fillByLabel('Nom du DPO', 'Hadis');
    await fillByLabel('Adresse e-mail du DPO', 'jacques.hadis@example.com');

    // then
    assert.strictEqual(certificationCenter.dataProtectionOfficerFirstName, 'Jacques');
    assert.strictEqual(certificationCenter.dataProtectionOfficerLastName, 'Hadis');
    assert.strictEqual(certificationCenter.dataProtectionOfficerEmail, 'jacques.hadis@example.com');
  });
});
