import { fillByLabel, render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import InformationEdit from 'pix-admin/components/certification-centers/information-edit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-centers/information-edit', function (hooks) {
  setupIntlRenderingTest(hooks);

  const certificationCenter = EmberObject.create('certification-center', {
    name: 'Centre SCO',
    type: 'SCO',
    externalId: 'AX129',
    dataProtectionOfficerFirstName: 'Justin',
    dataProtectionOfficerLastName: 'Ptipeu',
    dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
    habilitations: [],
  });

  const toggleEditModeStub = sinon.stub();
  const onSubmit = sinon.stub();

  let queryStub;

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    sinon
      .stub(store, 'findAll')
      .withArgs('structure-category')
      .resolves([
        store.createRecord('structure-category', { id: '111', label: 'Catégorie 1' }),
        store.createRecord('structure-category', { id: '222', label: 'Catégorie 2' }),
      ]);
    queryStub = sinon.stub(store, 'query').resolves([]);
  });

  module('certification center edit form validation', function () {
    test("it should show an error message if certification center's name is empty", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await fillByLabel('Nom du centre', '', { exact: false });

      // then
      assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
    });

    test("it should show an error message if certification center's name is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await fillByLabel('Nom du centre', 'a'.repeat(256), { exact: false });

      // then
      assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show an error message if certification center's type is empty", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Type' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: '-- Choisissez --' }));

      // then
      assert.dom(screen.getByText('Le type ne peut pas être vide')).exists();
    });

    test("it should show an error message if certification center's externalId is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await fillByLabel('Identifiant externe', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText("La longueur de l'identifiant externe ne doit pas excéder 255 caractères")).exists();
    });

    test("it should show an error message if certification center's data protection officer first name is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await fillByLabel('Prénom du DPO', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du prénom du DPO ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show an error message if certification center's data protection officer last name is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await fillByLabel('Nom du DPO', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du nom du DPO ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show an error message if certification center's data protection officer email is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await fillByLabel('Adresse e-mail du DPO', 'a'.repeat(255) + '@test.com');

      // then
      assert
        .dom(screen.getByText("La longueur de l'adresse e-mail du DPO ne doit pas excéder 255 caractères."))
        .exists();
    });

    test("it should show an error message if certification center's dataProtectionOfficerEmail is not valid", async function (assert) {
      // given
      const screen = await render(
        <template>
          <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
        </template>,
      );

      // when
      await fillByLabel('Adresse e-mail du DPO', 'invalid-email-format');

      // then
      assert.dom(screen.getByText("L'adresse e-mail du DPO n'a pas le bon format.")).exists();
    });
  });

  module('certification center edit form actions', function () {
    module('#cancel', function () {
      test('it should cancel the edition', async function (assert) {
        // given
        const screen = await render(
          <template>
            <InformationEdit @certificationCenter={{certificationCenter}} @toggleEditMode={{toggleEditModeStub}} />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Annuler' }));

        // then
        sinon.assert.calledOnce(toggleEditModeStub);
        assert.ok(true);
      });
    });

    module('#save', function () {
      test('it should save the certification center data', async function (assert) {
        // given
        const screen = await render(
          <template>
            <InformationEdit
              @certificationCenter={{certificationCenter}}
              @toggleEditMode={{toggleEditModeStub}}
              @onSubmit={{onSubmit}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        sinon.assert.calledOnce(onSubmit);
        assert.ok(true);
      });

      test('it should update the certification center data', async function (assert) {
        const screen = await render(
          <template>
            <InformationEdit
              @certificationCenter={{certificationCenter}}
              @toggleEditMode={{toggleEditModeStub}}
              @onSubmit={{onSubmit}}
            />
          </template>,
        );

        // when
        await fillByLabel('Nom du centre', 'newName', { exact: false });
        await click(screen.getByRole('button', { name: 'Type' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Établissement supérieur' }));
        await fillByLabel('Identifiant externe', 'newId');
        await fillByLabel('Prénom du DPO', 'newFirstname');
        await fillByLabel('Nom du DPO', 'newLastname');
        await fillByLabel('Adresse e-mail du DPO', 'newMail@example.net');

        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        assert.ok(onSubmit.called);
        assert.strictEqual(certificationCenter.name, 'newName');
        assert.strictEqual(certificationCenter.type, 'SUP');
        assert.strictEqual(certificationCenter.externalId, 'newId');
        assert.strictEqual(certificationCenter.dataProtectionOfficerFirstName, 'newFirstname');
        assert.strictEqual(certificationCenter.dataProtectionOfficerLastName, 'newLastname');
        assert.strictEqual(certificationCenter.dataProtectionOfficerEmail, 'newMail@example.net');
      });

      test('it should ask for confirmation when the attached organization has another category', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationCenter = EmberObject.create({
          id: '12',
          name: 'Centre SCO',
          type: 'SCO',
          categoryId: 111,
          habilitations: [],
        });
        queryStub
          .withArgs('attached-organization', { certificationCenterId: '12' })
          .resolves([store.createRecord('attached-organization', { id: '7', name: 'Orga' })]);

        const screen = await render(
          <template>
            <InformationEdit
              @certificationCenter={{certificationCenter}}
              @toggleEditMode={{toggleEditModeStub}}
              @onSubmit={{onSubmit}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Catégorie' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Catégorie 2' }));
        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        assert
          .dom(
            await screen.findByText(
              t('pages.certification-centers.information-edit.category.confirmation-modal.question', {
                organizationName: 'Orga',
              }),
            ),
          )
          .exists();
        assert.strictEqual(certificationCenter.categoryId, 111);

        // when
        await click(screen.getByRole('button', { name: 'Confirmer' }));

        // then
        assert.strictEqual(certificationCenter.categoryId, '222');
        assert.strictEqual(certificationCenter.categoryLabel, 'Catégorie 2');
      });

      test('it should not save the certification center when the confirmation is cancelled', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationCenter = EmberObject.create({
          id: '13',
          name: 'Centre SCO',
          type: 'SCO',
          categoryId: 111,
          habilitations: [],
        });
        queryStub
          .withArgs('attached-organization', { certificationCenterId: '13' })
          .resolves([store.createRecord('attached-organization', { id: '8', name: 'Orga' })]);

        const screen = await render(
          <template>
            <InformationEdit
              @certificationCenter={{certificationCenter}}
              @toggleEditMode={{toggleEditModeStub}}
              @onSubmit={{onSubmit}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Catégorie' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Catégorie 2' }));
        await click(screen.getByRole('button', { name: 'Enregistrer' }));
        await click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Annuler' }));

        // then
        assert.strictEqual(certificationCenter.categoryId, 111);
      });

      test('it should update the certification center category', async function (assert) {
        // given
        const certificationCenter = EmberObject.create({
          name: 'Centre SCO',
          type: 'SCO',
          categoryId: 111,
          habilitations: [],
        });

        const screen = await render(
          <template>
            <InformationEdit
              @certificationCenter={{certificationCenter}}
              @toggleEditMode={{toggleEditModeStub}}
              @onSubmit={{onSubmit}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Catégorie' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Catégorie 2' }));
        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        assert.strictEqual(certificationCenter.categoryId, '222');
      });

      test('it should add the habilitation to the certification center', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const availableHabilitations = [
          store.createRecord('complementary-certification', {
            id: '0',
            key: 'DROIT',
            label: 'Pix+Droit',
          }),
        ];

        const certificationCenter = store.createRecord('certification-center', {
          name: 'Centre SCO',
          type: 'SCO',
          externalId: 'AX129',
          dataProtectionOfficerFirstName: 'Lucky',
          dataProtectionOfficerLastName: 'Number',
          dataProtectionOfficerEmail: 'lucky@example.net',
          habilitations: [],
        });

        const screen = await render(
          <template>
            <InformationEdit
              @certificationCenter={{certificationCenter}}
              @availableHabilitations={{availableHabilitations}}
              @toggleEditMode={{toggleEditModeStub}}
              @onSubmit={{onSubmit}}
            />
          </template>,
        );

        // when

        await click(screen.getByLabelText('Pix+Droit'));

        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        assert.ok(toggleEditModeStub.called);
        assert.ok(onSubmit.called);
        const habilitations = await certificationCenter.habilitations;
        assert.ok(habilitations.includes(availableHabilitations[0]));
      });

      test('it should remove the habilitation to the certification center', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const availableHabilitations = [
          store.createRecord('complementary-certification', {
            id: '0',
            key: 'DROIT',
            label: 'Pix+Droit',
          }),
        ];

        const certificationCenter = store.createRecord('certification-center', {
          name: 'Centre SCO',
          type: 'SCO',
          externalId: 'AX129',
          dataProtectionOfficerFirstName: 'Lucky',
          dataProtectionOfficerLastName: 'Number',
          dataProtectionOfficerEmail: 'lucky@example.net',
          habilitations: [availableHabilitations[0]],
        });

        const screen = await render(
          <template>
            <InformationEdit
              @certificationCenter={{certificationCenter}}
              @availableHabilitations={{availableHabilitations}}
              @toggleEditMode={{toggleEditModeStub}}
              @onSubmit={{onSubmit}}
            />
          </template>,
        );

        // when

        await click(screen.getByLabelText('Pix+Droit'));

        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        assert.ok(toggleEditModeStub.called);
        assert.ok(onSubmit.called);
        const habilitations = await certificationCenter.habilitations;
        assert.strictEqual(habilitations.length, 0);
      });
    });
  });
});
