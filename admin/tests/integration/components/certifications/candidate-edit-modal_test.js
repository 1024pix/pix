import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { fillByLabel } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

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
      await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{countries}} />`
      );

      // then
      assert.contains('Editer les informations du candidat');
    });

    test('it should not display the modal', async function (assert) {
      // given
      this.candidate = run(() => store.createRecord('certification', { birthdate: '2000-12-15' }));
      this.countries = [];

      // when
      await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{false}} @candidate={{candidate}} @countries={{countries}} />`
      );

      // then
      assert.notContains('Editer les informations du candidat');
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
        })
      );
      this.countries = [
        run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
        run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
      ];

      // when
      await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`
      );

      // then
      assert.dom('#first-name').hasValue('Fabrice');
      assert.dom('#last-name').hasValue('Gadjo');
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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`
        );

        // then
        assert.dom('#male').isChecked();
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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`
        );

        // then
        assert.dom('#female').isChecked();
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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`
        );

        // then
        assert.dom('#birth-insee-code').doesNotExist();
        assert.dom('#birth-postal-code').doesNotExist();
        const options = this.element.querySelectorAll('option');
        assert.true(options.item(0).selected);
        assert.dom('#birth-city').hasValue('Copenhague');
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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`
        );

        // then
        assert.dom('#birth-postal-code').hasValue('66440');
        assert.dom('#birth-insee-code').doesNotExist();
        assert.dom('#birth-city').hasValue('Torreilles');
        const options = this.element.querySelectorAll('option');
        assert.true(options.item(1).selected);
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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];

        // when
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{this.candidate}} @countries={{this.countries}} />`
        );

        // then
        assert.dom('#birth-insee-code').hasValue('66212');
        assert.dom('#birth-postal-code').doesNotExist();
        assert.dom('#birth-city').doesNotExist();
        const options = this.element.querySelectorAll('option');
        assert.true(options.item(1).selected);
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
        })
      );
      this.countries = [
        run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
        run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
      ];
      this.onCancelButtonsClickedStub = sinon.stub();
      await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}}  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}} @countries={{countries}} />`
      );
      await fillByLabel('* Nom de famille', 'Belmans');
      await fillByLabel('* Prénom', 'Gideona');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await click('#female');
      await fillByLabel('Pays de naissance', '99100');
      await click('#postal-code-choice');
      await fillByLabel('* Code postal de naissance', '75001');
      await fillByLabel('* Commune de naissance', 'PARIS 01');

      // when
      await clickByLabel('Annuler');

      // then
      assert.dom('#first-name').hasValue('Fabrice');
      assert.dom('#last-name').hasValue('Gadjo');
      assert.dom('#birthdate').hasValue('2000-12-15');
      assert.dom('#male').isChecked;
      assert.dom('#birth-insee-code').doesNotExist();
      assert.dom('#birth-postal-code').doesNotExist();
      assert.dom('#birth-city').hasValue('Copenhague');
      const options = this.element.querySelectorAll('option');
      assert.true(options.item(0).selected);
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
        })
      );
      const initialCandidateInformation = this.candidate.getInformation();
      this.countries = [
        run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
        run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
      ];
      this.onCancelButtonsClickedStub = sinon.stub();
      await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}}  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}} @countries={{countries}} />`
      );
      await fillByLabel('* Nom de famille', 'Belmans');
      await fillByLabel('* Prénom', 'Gideona');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await click('#female');
      await fillByLabel('Pays de naissance', '99100');
      await click('#postal-code-choice');
      await fillByLabel('* Code postal de naissance', '75001');
      await fillByLabel('* Commune de naissance', 'PARIS 01');

      // when
      await clickByLabel('Annuler');

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
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}}  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}} @countries={{countries}} />`
      );

      // when
      await clickByLabel('Annuler');

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
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @onFormSubmit={{this.onFormSubmitStub}} @countries={{countries}} />`
      );

      // when
      await clickByLabel('Enregistrer');

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
        })
      );
      this.countries = [
        EmberObject.create({ code: '99101', name: 'DANEMARK' }),
        EmberObject.create({ code: '99100', name: 'FRANCE' }),
      ];
      this.onFormSubmitStub = sinon.stub();
      await render(
        hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @onFormSubmit={{this.onFormSubmitStub}} @countries={{countries}} />`
      );
      await fillByLabel('* Nom de famille', 'Belmans');
      await fillByLabel('* Prénom', 'Gideon');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await click('#male');
      await fillByLabel('Pays de naissance', '99100');
      await click('#postal-code-choice');
      await fillByLabel('* Code postal de naissance', '75001');
      await fillByLabel('* Commune de naissance', 'PARIS 01');

      // when
      await clickByLabel('Enregistrer');

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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        this.onFormSubmitStub = sinon.stub();
        this.onFormSubmitStub.resolves();
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}} @onFormSubmit={{this.onFormSubmitStub}}/>`
        );

        // when
        await fillByLabel('Pays de naissance', '99101');
        await fillByLabel('* Commune de naissance', 'Copenhague');
        await clickByLabel('Enregistrer');

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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        this.onFormSubmitStub = sinon.stub();
        this.onFormSubmitStub.resolves();
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}} @onFormSubmit={{this.onFormSubmitStub}}/>`
        );

        // when
        await fillByLabel('Pays de naissance', '99100');
        await click('#insee-code-choice');
        await fillByLabel('* Code Insee de naissance', '66212');
        await clickByLabel('Enregistrer');

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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        this.onFormSubmitStub = sinon.stub();
        this.onFormSubmitStub.resolves();
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}} @onFormSubmit={{this.onFormSubmitStub}}/>`
        );

        // when
        await fillByLabel('Pays de naissance', '99100');
        await click('#postal-code-choice');
        await fillByLabel('* Code postal de naissance', '66440');
        await fillByLabel('* Commune de naissance', 'Torreilles');
        await clickByLabel('Enregistrer');

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
          })
        );
        this.countries = [
          run(() => store.createRecord('country', { code: '99101', name: 'DANEMARK' })),
          run(() => store.createRecord('country', { code: '99100', name: 'FRANCE' })),
        ];
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}}/>`
        );

        // when
        await fillByLabel('Pays de naissance', '99101');

        // then
        assert.notContains('* Code Insee de naissance');
        assert.notContains('* Code postal de naissance');
        assert.contains('* Commune de naissance');
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
          })
        );
        this.countries = [];
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}}/>`
        );

        // when
        await click('#insee-code-choice');

        // then
        assert.contains('* Code Insee de naissance');
        assert.notContains('* Code postal de naissance');
        assert.notContains('* Commune de naissance');
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
          })
        );
        this.countries = [];
        await render(
          hbs`<Certifications::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}}/>`
        );

        // when
        await click('#postal-code-choice');

        // then
        assert.notContains('Code INSEE de naissance');
        assert.contains('* Code postal de naissance');
        assert.contains('* Commune de naissance');
      });
    });
  });
});
