import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';

import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | <Certification::CandidateEditModal/>', function(hooks) {
  setupRenderingTest(hooks);

  module('#display', function() {

    test('it should display the modal', async function(assert) {
      // given
      this.candidate = EmberObject.create({ birthdate: '2000-12-15' });
      this.countries = [];

      // when
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{countries}} />`);

      // then
      assert.contains('Editer les informations du candidat');
    });

    test('it should not display the modal', async function(assert) {
      // given
      this.candidate = EmberObject.create({ birthdate: '2000-12-15' });
      this.countries = [];

      // when
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{false}} @candidate={{candidate}} @countries={{countries}} />`);

      // then
      assert.notContains('Editer les informations du candidat');
    });
  });

  module('#onCancelButtonsClicked', function() {

    test('it should reset form', async function(assert) {
      // given
      this.candidate = EmberObject.create({
        firstName: 'Fabrice',
        lastName: 'Gadjo',
        birthdate: '2000-12-15',
        sex: 'F',
        birthInseeCode: '99101',
        birthplace: 'Copenhague',
        birthCountry: 'DANEMARK',
      });
      this.countries = [
        EmberObject.create({ code: '99101', name: 'DANEMARK' }),
        EmberObject.create({ code: '99100', name: 'FRANCE' }),
      ];
      this.onCancelButtonsClickedStub = sinon.stub();
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}}  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}} @countries={{countries}} />`);
      await fillInByLabel('Nom de famille', 'Belmans');
      await fillInByLabel('Prénom', 'Gideon');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await click('#male');
      await fillInByLabel('Pays de naissance', '99100');
      await click('#postal-code-choice');
      await fillInByLabel('Code postal de naissance', '75001');
      await fillInByLabel('Commune de naissance', 'PARIS 01');

      // when
      await clickByLabel('Annuler');

      // then
      assert.equal(this.candidate.firstName, 'Fabrice');
      assert.dom('#first-name').hasValue('Fabrice');
      assert.equal(this.candidate.lastName, 'Gadjo');
      assert.dom('#last-name').hasValue('Gadjo');
      assert.equal(this.candidate.birthdate, '2000-12-15');
      assert.dom('#birthdate').hasValue('2000-12-15');
      assert.equal(this.candidate.sex, 'F');
      assert.dom('#female').isChecked;
      assert.equal(this.candidate.birthInseeCode, '99101');
      assert.dom('#birth-insee-code').doesNotExist();
      assert.equal(this.candidate.birthplace, 'Copenhague');
      assert.dom('#birth-city').hasValue('');
      assert.equal(this.candidate.birthCountry, 'DANEMARK');
      assert.dom('#birth-country > option[selected]').hasText('DANEMARK');
    });

    test('it should call the onCancelButtonsClicked action', async function(assert) {
      // given
      this.candidate = EmberObject.create({ birthdate: '2000-12-15' });
      this.countries = [];
      this.onCancelButtonsClickedStub = sinon.stub();
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}}  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}} @countries={{countries}} />`);

      // when
      await clickByLabel('Annuler');

      // then
      assert.ok(this.onCancelButtonsClickedStub.called);
    });
  });

  module('#onFormSubmit', function() {

    test('it should not call the onFormSubmit action if a field is not filled', async function(assert) {
      // given
      this.candidate = EmberObject.create({ birthdate: '2000-12-15' });
      this.countries = [];
      this.onFormSubmitStub = sinon.stub();
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @onFormSubmit={{this.onFormSubmitStub}} @countries={{countries}} />`);

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.notOk(this.onFormSubmitStub.called);
    });

    test('it should call the onFormSubmit action if all fields are filled', async function(assert) {
      // given
      this.candidate = EmberObject.create({
        firstName: 'Fabrice',
        lastName: 'Gadjo',
        birthdate: '2000-12-15',
        sex: 'F',
        birthInseeCode: '99101',
        birthplace: 'Copenhague',
        birthCountry: 'DANEMARK',
      });
      this.countries = [
        EmberObject.create({ code: '99101', name: 'DANEMARK' }),
        EmberObject.create({ code: '99100', name: 'FRANCE' }),
      ];
      this.onFormSubmitStub = sinon.stub();
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @onFormSubmit={{this.onFormSubmitStub}} @countries={{countries}} />`);
      await fillInByLabel('Nom de famille', 'Belmans');
      await fillInByLabel('Prénom', 'Gideon');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await click('#male');
      await fillInByLabel('Pays de naissance', '99100');
      await click('#postal-code-choice');
      await fillInByLabel('Code postal de naissance', '75001');
      await fillInByLabel('Commune de naissance', 'PARIS 01');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.ok(this.onFormSubmitStub.called);
      assert.equal(this.candidate.firstName, 'Gideon');
      assert.equal(this.candidate.lastName, 'Belmans');
      assert.equal(this.candidate.birthdate, '1861-03-17');
      assert.equal(this.candidate.sex, 'M');
      assert.equal(this.candidate.birthPostalCode, '75001');
      assert.equal(this.candidate.birthplace, 'PARIS 01');
      assert.equal(this.candidate.birthCountry, 'FRANCE');
    });
  });

  test('it should display candidate information to edit', async function(assert) {
    // given
    this.candidate = EmberObject.create({
      firstName: 'Quentin',
      lastName: 'Lebouc',
      birthdate: '2000-12-15',
      sex: 'M',
      birthPostalCode: '35400',
      birthplace: 'Saint-Malo',
      birthCountry: 'FRANCE',
    });
    this.countries = [
      EmberObject.create({ code: '99101', name: 'DANEMARK' }),
      EmberObject.create({ code: '99100', name: 'FRANCE' }),
    ];

    // when
    await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{countries}} />`);

    // then
    assert.dom('#first-name').hasValue('Quentin');
    assert.dom('#last-name').hasValue('Lebouc');
    assert.dom('#birthdate').hasValue('2000-12-15');
    assert.dom('#male').isChecked();
    assert.dom('#birth-postal-code').hasValue('35400');
    assert.dom('#birth-city').hasValue('Saint-Malo');
    assert.dom('#birth-country > option[selected]').hasText('FRANCE');
  });

  module('on component creation', function() {

    test('it should select the insee code option if the candidate insee code is defined', async function(assert) {
      // given
      this.candidate = EmberObject.create({
        firstName: 'Quentin',
        lastName: 'Lebouc',
        birthdate: '2000-12-15',
        sex: 'M',
        birthInseeCode: '35400',
        birthplace: 'Saint-Malo',
        birthCountry: 'FRANCE',
      });
      this.countries = [];

      // when
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{countries}} />`);

      // then
      assert.dom('#insee-code-choice').isChecked();
    });

    test('it should select the postal code option if the candidate postal code is defined', async function(assert) {
      // given
      this.candidate = EmberObject.create({
        firstName: 'Quentin',
        lastName: 'Lebouc',
        birthdate: '2000-12-15',
        sex: 'M',
        birthPostalCode: '35400',
        birthplace: 'Saint-Malo',
        birthCountry: 'FRANCE',
      });
      this.countries = [];

      // when
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{countries}} />`);

      // then
      assert.dom('#postal-code-choice').isChecked();
    });
  });

  module('when a foreign country is selected', () => {

    test('it shows city field and hides insee code and postal code fields', async function(assert) {
      // given
      this.candidate = EmberObject.create({
        firstName: 'Fabrice',
        lastName: 'Gadjo',
        birthdate: '2000-12-15',
        sex: 'F',
        birthInseeCode: '75015',
        birthplace: 'PARIS 15',
        birthCountry: 'FRANCE',
      });
      this.countries = [
        EmberObject.create({ code: '99101', name: 'DANEMARK' }),
        EmberObject.create({ code: '99100', name: 'FRANCE' }),
      ];
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}}/>`);

      // when
      await fillInByLabel('Pays de naissance', '99101');

      // then
      assert.notContains('Code Insee de naissance');
      assert.notContains('Code postal de naissance');
      assert.contains('Commune de naissance');
    });
  });

  module('when the insee code option is selected', () => {

    test('it shows insee code field and hides postal code and city fields', async function(assert) {
      // given
      this.candidate = EmberObject.create({
        firstName: 'Fabrice',
        lastName: 'Gadjo',
        birthdate: '2000-12-15',
        sex: 'F',
        birthPostalCode: '75015',
        birthplace: 'PARIS 15',
        birthCountry: 'FRANCE',
      });
      this.countries = [];
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}}/>`);

      // when
      await click('#insee-code-choice');

      // then
      assert.contains('Code Insee de naissance');
      assert.notContains('Code postal de naissance');
      assert.notContains('Commune de naissance');
    });
  });

  module('when the postal code option is selected', () => {

    test('it shows postal code and city fields and hides insee code field', async function(assert) {
      // given
      this.candidate = EmberObject.create({
        firstName: 'Fabrice',
        lastName: 'Gadjo',
        birthdate: '2000-12-15',
        sex: 'F',
        birthInseeCode: '75115',
        birthplace: 'PARIS 15',
        birthCountry: 'FRANCE',
      });
      this.countries = [];
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @countries={{this.countries}}/>`);

      // when
      await click('#postal-code-choice');

      // then
      assert.notContains('Code INSEE de naissance');
      assert.contains('Code postal de naissance');
      assert.contains('Commune de naissance');
    });
  });
});
