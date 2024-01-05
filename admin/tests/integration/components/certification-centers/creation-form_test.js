import { module, test } from 'qunit';
import { render, fillByLabel } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-centers/creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the new certification center form component', async function (assert) {
    // given
    this.onSubmit = () => {};
    this.onCancel = () => {};
    this.certificationCenter = {};

    // when
    const screen = await render(
      hbs`<CertificationCenters::CreationForm
        @certificationCenter={{this.certificationCenter}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`,
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
      this.certificationCenter = store.createRecord('certification-center');
      this.habilitations = [];
      this.stub = () => {};

      const screen = await render(
        hbs`<CertificationCenters::CreationForm
          @certificationCenter={{this.certificationCenter}}
          @habilitations={{this.habilitations}}
          @onSubmit={{this.stub}}
          @onCancel={{this.stub}}
        />`,
      );

      // when
      await click(
        screen.getByRole('checkbox', {
          name: 'Pilote Certification V3 (ce centre de certification ne pourra organiser que des sessions V3)',
        }),
      );

      // then
      assert.true(this.certificationCenter.isV3Pilot);
    });
  });

  module('#selectCertificationCenterType', function () {
    test('should update attribute certificationCenter.type', async function (assert) {
      // given
      this.onSubmit = () => {};
      this.onCancel = () => {};
      this.certificationCenter = {};
      const screen = await render(
        hbs`<CertificationCenters::CreationForm
          @certificationCenter={{this.certificationCenter}}
          @onSubmit={{this.onSubmit}}
          @onCancel={{this.onCancel}}
        />`,
      );

      // when
      await click(screen.getByRole('button', { name: "Type d'établissement" }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Établissement scolaire' }));

      // then
      assert.strictEqual(this.certificationCenter.type, 'SCO');
    });
  });

  module('#updateGrantedHabilitation', function () {
    test('should add habilitation to certification center on checked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitation1 = store.createRecord('complementary-certification', { key: 'E', label: 'Pix+Edu' });
      const habilitation2 = store.createRecord('complementary-certification', { key: 'S', label: 'Pix+Surf' });
      this.certificationCenter = store.createRecord('certification-center');
      this.habilitations = [habilitation1, habilitation2];
      this.stub = () => {};

      const screen = await render(
        hbs`<CertificationCenters::CreationForm
          @certificationCenter={{this.certificationCenter}}
          @habilitations={{this.habilitations}}
          @onSubmit={{this.stub}}
          @onCancel={{this.stub}}
        />`,
      );

      // when
      await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));

      // then
      assert.ok(this.certificationCenter.habilitations.includes(habilitation2));
    });

    test('should remove habilitation to certification center on unchecked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitation1 = store.createRecord('complementary-certification', { key: 'E', label: 'Pix+Edu' });
      const habilitation2 = store.createRecord('complementary-certification', { key: 'S', label: 'Pix+Surf' });
      this.certificationCenter = store.createRecord('certification-center', {
        habilitations: [habilitation2],
      });
      this.habilitations = [habilitation1, habilitation2];
      this.stub = () => {};

      const screen = await render(
        hbs`<CertificationCenters::CreationForm
          @certificationCenter={{this.certificationCenter}}
          @habilitations={{this.habilitations}}
          @onSubmit={{this.stub}}
          @onCancel={{this.stub}}
        />`,
      );

      // when
      await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));

      // then
      assert.notOk(this.certificationCenter.habilitations.includes(habilitation2));
    });
  });

  test('it should be possible to add data protection officer names and email', async function (assert) {
    // given
    this.onSubmit = () => {};
    this.onCancel = () => {};
    const store = this.owner.lookup('service:store');
    this.certificationCenter = store.createRecord('certificationCenter', { name: 'Super centre' });
    await render(
      hbs`<CertificationCenters::CreationForm @certificationCenter={{this.certificationCenter}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`,
    );

    // when
    await fillByLabel('Prénom du DPO', 'Jacques');
    await fillByLabel('Nom du DPO', 'Hadis');
    await fillByLabel('Adresse e-mail du DPO', 'jacques.hadis@example.com');

    // then
    assert.strictEqual(this.certificationCenter.dataProtectionOfficerFirstName, 'Jacques');
    assert.strictEqual(this.certificationCenter.dataProtectionOfficerLastName, 'Hadis');
    assert.strictEqual(this.certificationCenter.dataProtectionOfficerEmail, 'jacques.hadis@example.com');
  });
});
