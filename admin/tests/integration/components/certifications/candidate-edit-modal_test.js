import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillByLabel, clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import { click } from '@ember/test-helpers';

module('Integration | Component | certifications/candidate-edit-modal', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#display', function () {
    test('it should display the modal', async function (assert) {
      // given
      this.candidate = run(() => store.createRecord('certification', { birthdate: '2000-12-15' }));
      this.countries = [];

      // when
      const screen = await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: 'Modifier les informations du candidat' })).exists();
    });
  });

  module('#form initialization', function () {
    test('it should initialize common information', async function (assert) {
      // given
      this.candidate = run(() =>
        store.createRecord('certification', {
          firstName: 'Fabrice',
          lastName: 'Gadjo',
          birthdate: '2000-12-15',
          sex: 'M',
          birthInseeCode: null,
          birthPostalCode: '66440',
          birthplace: 'Torreilles',
          birthCountry: 'FRANCE',
        }),
      );
      this.countries = [
        run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
        run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
      ];

      // when
      const screen = await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Prénom' })).hasValue('Fabrice');
      assert.dom(screen.getByRole('textbox', { name: 'Nom de famille' })).hasValue('Gadjo');
      assert.dom('#birthdate').hasValue('2000-12-15');
    });

    module('#sex', function () {
      test('it should check "Homme" option when candidate is male', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'M',
            birthInseeCode: null,
            birthPostalCode: '66440',
            birthplace: 'Torreilles',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // then
        assert.dom(screen.getByRole('radio', { name: 'Homme' })).isChecked();
      });

      test('it should check "Femme" option when candidate is female', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabricia',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'F',
            birthInseeCode: null,
            birthPostalCode: '66440',
            birthplace: 'Torreilles',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // then
        assert.dom(screen.getByRole('radio', { name: 'Femme' })).isChecked();
      });
    });

    module('when candidate birth information are of type foreign country', function () {
      test('it should init the form with expected informations for type foreign country', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'M',
            birthInseeCode: '99101',
            birthPostalCode: null,
            birthplace: 'Copenhague',
            birthCountry: 'DANEMARK',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // then
        assert.dom(screen.queryByRole('textbox', { name: 'Code Insee de naissance' })).doesNotExist();
        assert.dom(screen.queryByRole('textbox', { name: 'Code postal de naissance' })).doesNotExist();
        assert.dom(screen.getByRole('button', { name: 'Pays de naissance' })).containsText('DANEMARK');
        assert.dom(screen.getByRole('textbox', { name: 'Commune de naissance' })).hasValue('Copenhague');
      });
    });

    module('when candidate birth information are of type France with postal code', function () {
      test('it should init the form with expected informations for type France with postal code', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'M',
            birthInseeCode: null,
            birthPostalCode: '66440',
            birthplace: 'Torreilles',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Code postal de naissance' })).hasValue('66440');
        assert.dom(screen.queryByRole('textbox', { name: 'Code Insee de naissance' })).doesNotExist();
        assert.dom(screen.getByRole('textbox', { name: 'Commune de naissance' })).hasValue('Torreilles');
        assert.dom(screen.getByRole('button', { name: 'Pays de naissance' })).containsText('FRANCE');
      });
    });

    module('when candidate birth information are of type France with INSEE code', function () {
      test('it should init the form with expected informations for type France with INSEE code', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'M',
            birthInseeCode: '66212',
            birthPostalCode: null,
            birthplace: 'Torreilles',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // then
        assert.dom(screen.queryByRole('textbox', { name: 'Code postal de naissance' })).doesNotExist();
        assert.dom(screen.getByRole('textbox', { name: 'Code Insee de naissance' })).hasValue('66212');
        assert.dom(screen.queryByRole('textbox', { name: 'Commune de naissance' })).doesNotExist();
        assert.dom(screen.getByRole('button', { name: 'Pays de naissance' })).containsText('FRANCE');
      });
    });
  });

  module('#onCancelButtonsClicked', function () {
    test('it should reset form', async function (assert) {
      // given
      this.candidate = run(() =>
        store.createRecord('certification', {
          firstName: 'Fabrice',
          lastName: 'Gadjo',
          birthdate: '2000-12-15',
          sex: 'M',
          birthInseeCode: '99101',
          birthplace: 'Copenhague',
          birthCountry: 'DANEMARK',
        }),
      );
      this.countries = [
        run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
        run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
      ];
      this.onCancelButtonsClickedStub = sinon.stub();
      const screen = await render(
        hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}}
  @countries={{this.countries}}
/>`,
      );

      await fillByLabel('Nom de famille', 'Belmans');
      await fillByLabel('Prénom', 'Gideona');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await clickByName('Femme');

      await click(screen.getByRole('button', { name: 'Pays de naissance' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'FRANCE' }));

      await clickByName('Code postal');
      await fillByLabel('Code postal de naissance', '75001');
      await fillByLabel('Commune de naissance', 'PARIS 01');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Prénom' })).hasValue('Fabrice');
      assert.dom(screen.getByRole('textbox', { name: 'Nom de famille' })).hasValue('Gadjo');
      assert.dom('#birthdate').hasValue('2000-12-15');
      assert.dom(screen.getByRole('radio', { name: 'Homme' })).isChecked();
      assert.dom(screen.queryByRole('textbox', { name: 'Code Insee de naissance' })).doesNotExist();
      assert.dom(screen.queryByRole('textbox', { name: 'Code postal de naissance' })).doesNotExist();
      assert.dom(screen.getByRole('textbox', { name: 'Commune de naissance' })).hasValue('Copenhague');
      assert.dom(screen.getByRole('button', { name: 'Pays de naissance' })).containsText('DANEMARK');
    });

    test('it should not alter candidate information', async function (assert) {
      // given
      this.candidate = run(() =>
        store.createRecord('certification', {
          firstName: 'Fabrice',
          lastName: 'Gadjo',
          birthdate: '2000-12-15',
          sex: 'F',
          birthInseeCode: '99101',
          birthplace: 'Copenhague',
          birthCountry: 'DANEMARK',
        }),
      );
      const initialCandidateInformation = this.candidate.getInformation();
      this.countries = [
        run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
        run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
      ];
      this.onCancelButtonsClickedStub = sinon.stub();
      const screen = await render(
        hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}}
  @countries={{this.countries}}
/>`,
      );
      await fillByLabel('Nom de famille', 'Belmans');
      await fillByLabel('Prénom', 'Gideona');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await clickByName('Femme');

      await click(screen.getByRole('button', { name: 'Pays de naissance' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'FRANCE' }));

      await clickByName('Code postal');
      await fillByLabel('Code postal de naissance', '75001');
      await fillByLabel('Commune de naissance', 'PARIS 01');

      // when
      await clickByName('Annuler');

      // then
      const afterCancelCandidateInformation = this.candidate.getInformation();
      assert.deepEqual(initialCandidateInformation, afterCancelCandidateInformation);
    });

    test('it should call the onCancelButtonsClicked action', async function (assert) {
      // given
      this.candidate = run(() => store.createRecord('certification', { birthdate: '2000-12-15' }));
      this.countries = [];
      this.onCancelButtonsClickedStub = sinon.stub();
      await render(
        hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}}
  @countries={{this.countries}}
/>`,
      );

      // when
      await clickByName('Annuler');

      // then
      assert.ok(this.onCancelButtonsClickedStub.called);
    });
  });

  module('#onFormSubmit', function () {
    test('it should not call the onFormSubmit action if a field is not filled', async function (assert) {
      // given
      this.candidate = run(() => store.createRecord('certification', { birthdate: '2000-12-15' }));
      this.countries = [];
      this.onFormSubmitStub = sinon.stub();
      await render(
        hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @onFormSubmit={{this.onFormSubmitStub}}
  @countries={{this.countries}}
/>`,
      );

      // when
      await clickByName('Enregistrer');

      // then
      assert.notOk(this.onFormSubmitStub.called);
    });

    test('it should call the onFormSubmit action if all fields are filled', async function (assert) {
      // given
      this.candidate = run(() =>
        store.createRecord('certification', {
          firstName: 'Fabrice',
          lastName: 'Gadjo',
          birthdate: '2000-12-15',
          sex: 'F',
          birthInseeCode: '99101',
          birthplace: 'Copenhague',
          birthCountry: 'DANEMARK',
        }),
      );
      this.countries = [
        EmberObject.create({ code: '99101', name: 'DANEMARK' }),
        EmberObject.create({ code: '99100', name: 'FRANCE' }),
      ];
      this.onFormSubmitStub = sinon.stub();
      const screen = await render(
        hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @onFormSubmit={{this.onFormSubmitStub}}
  @countries={{this.countries}}
/>`,
      );
      await fillByLabel('Nom de famille', 'Belmans');
      await fillByLabel('Prénom', 'Gideon');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await clickByName('Homme');

      await click(screen.getByRole('button', { name: 'Pays de naissance' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'FRANCE' }));

      await clickByName('Code postal');
      await fillByLabel('Code postal de naissance', '75001');
      await fillByLabel('Commune de naissance', 'PARIS 01');

      // when
      await clickByName('Enregistrer');

      // then
      assert.ok(this.onFormSubmitStub.called);
    });

    module('when editing candidate information with foreign country info', function () {
      test('it should update candidate information with foreign country expected information', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'F',
            birthInseeCode: '75015',
            birthPostalCode: null,
            birthplace: 'PARIS 15',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        this.onFormSubmitStub = sinon.stub();
        this.onFormSubmitStub.resolves();
        const screen = await render(
          hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @countries={{this.countries}}
  @onFormSubmit={{this.onFormSubmitStub}}
/>`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Pays de naissance' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'DANEMARK' }));

        await fillByLabel('Commune de naissance', 'Copenhague');
        await clickByName('Enregistrer');

        // then
        assert.deepEqual(this.candidate.getInformation(), {
          firstName: 'Fabrice',
          lastName: 'Gadjo',
          birthdate: '2000-12-15',
          sex: 'F',
          birthInseeCode: '99',
          birthPostalCode: '',
          birthplace: 'Copenhague',
          birthCountry: 'DANEMARK',
        });
      });
    });

    module('when editing candidate information with france INSEE code info', function () {
      test('it should update candidate information with france INSEE code expected information', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'F',
            birthInseeCode: '99101',
            birthPostalCode: null,
            birthplace: 'Copenhague',
            birthCountry: 'DANEMARK',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        this.onFormSubmitStub = sinon.stub();
        this.onFormSubmitStub.resolves();
        const screen = await render(
          hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @countries={{this.countries}}
  @onFormSubmit={{this.onFormSubmitStub}}
/>`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Pays de naissance' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'FRANCE' }));

        await clickByName('Code INSEE');
        await fillByLabel('Code Insee de naissance', '66212');
        await clickByName('Enregistrer');

        // then
        assert.deepEqual(this.candidate.getInformation(), {
          firstName: 'Fabrice',
          lastName: 'Gadjo',
          birthdate: '2000-12-15',
          sex: 'F',
          birthInseeCode: '66212',
          birthPostalCode: '',
          birthplace: '',
          birthCountry: 'FRANCE',
        });
      });
    });

    module('when editing candidate information with france postal code info', function () {
      test('it should update candidate information with france postal code expected information', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'F',
            birthInseeCode: '99101',
            birthPostalCode: null,
            birthplace: 'Copenhague',
            birthCountry: 'DANEMARK',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        this.onFormSubmitStub = sinon.stub();
        this.onFormSubmitStub.resolves();
        const screen = await render(
          hbs`<Certifications::CandidateEditModal
  @isDisplayed={{true}}
  @candidate={{this.candidate}}
  @countries={{this.countries}}
  @onFormSubmit={{this.onFormSubmitStub}}
/>`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Pays de naissance' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'FRANCE' }));

        await clickByName('Code postal');
        await fillByLabel('Code postal de naissance', '66440');
        await fillByLabel('Commune de naissance', 'Torreilles');
        await clickByName('Enregistrer');

        // then
        assert.deepEqual(this.candidate.getInformation(), {
          firstName: 'Fabrice',
          lastName: 'Gadjo',
          birthdate: '2000-12-15',
          sex: 'F',
          birthInseeCode: '',
          birthPostalCode: '66440',
          birthplace: 'Torreilles',
          birthCountry: 'FRANCE',
        });
      });
    });
  });

  module('#UI choregraphy', function () {
    module('when a foreign country is selected', () => {
      test('it shows city field and hides insee code and postal code fields', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'F',
            birthInseeCode: '75015',
            birthplace: 'PARIS 15',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Pays de naissance' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'DANEMARK' }));

        // then
        assert.dom(screen.queryByText('Code Insee de naissance')).doesNotExist();
        assert.dom(screen.queryByText('Code postal de naissance')).doesNotExist();
        assert.dom(screen.getByLabelText('Commune de naissance')).exists();
      });
    });

    module('when the insee code option is selected', () => {
      test('it shows insee code field and hides postal code and city fields', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'F',
            birthPostalCode: '75015',
            birthplace: 'PARIS 15',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [];
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // when
        await clickByName('Code INSEE');

        // then
        assert.dom(screen.getByLabelText('Code Insee de naissance')).exists();
        assert.dom(screen.queryByText('Code postal de naissance')).doesNotExist();
        assert.dom(screen.queryByText('Commune de naissance')).doesNotExist();
      });
    });

    module('when the postal code option is selected', () => {
      test('it shows postal code and city fields and hides insee code field', async function (assert) {
        // given
        this.candidate = run(() =>
          store.createRecord('certification', {
            firstName: 'Fabrice',
            lastName: 'Gadjo',
            birthdate: '2000-12-15',
            sex: 'F',
            birthInseeCode: '75115',
            birthplace: 'PARIS 15',
            birthCountry: 'FRANCE',
          }),
        );
        this.countries = [];
        const screen = await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`,
        );

        // when
        await clickByName('Code postal');

        // then
        assert.dom(screen.queryByText('Code INSEE de naissance')).doesNotExist();
        assert.dom(screen.getByLabelText('Code postal de naissance')).exists();
        assert.dom(screen.getByLabelText('Commune de naissance')).exists();
      });
    });
  });
});
