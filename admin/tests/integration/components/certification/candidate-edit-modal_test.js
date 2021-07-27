import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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

      // when
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} />`);

      // then
      assert.contains('Editer les informations du candidat');
    });

    test('it should not display the modal', async function(assert) {
      // given
      this.candidate = EmberObject.create({ birthdate: '2000-12-15' });

      // when
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{false}} @candidate={{candidate}}  />`);

      // then
      assert.notContains('Editer les informations du candidat');
    });
  });

  module('#onCancelButtonsClicked', function() {

    test('it should call the onCancelButtonsClicked action', async function(assert) {
      // given
      this.candidate = EmberObject.create({ birthdate: '2000-12-15' });
      this.onCancelButtonsClickedStub = sinon.stub();
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}}  @onCancelButtonsClicked={{this.onCancelButtonsClickedStub}}/>`);

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
      this.onFormSubmitStub = sinon.stub();
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @onFormSubmit={{this.onFormSubmitStub}}/>`);

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.notOk(this.onFormSubmitStub.called);
    });

    test('it should reset form and model after save has failed', async function(assert) {
      // given
      this.candidate = EmberObject.create({ firstName: 'Fabrice', lastName: 'Gadjo', birthdate: '2000-12-15', birthplace: 'Trouville' });
      this.onFormSubmitStub = sinon.stub();
      this.onFormSubmitStub.rejects();

      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @onFormSubmit={{this.onFormSubmitStub}}/>`);
      await fillInByLabel('Nom de famille', 'Belmans');
      await fillInByLabel('Prénom', 'Gideon');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await fillInByLabel('Commune de naissance', 'Ormeshadow');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.equal(this.candidate.firstName, 'Fabrice');
      assert.dom('#first-name').hasValue('Fabrice');
      assert.equal(this.candidate.lastName, 'Gadjo');
      assert.dom('#last-name').hasValue('Gadjo');
      assert.equal(this.candidate.birthdate, '2000-12-15');
      assert.dom('#birthdate').hasValue('2000-12-15');
      assert.equal(this.candidate.birthplace, 'Trouville');
      assert.dom('#birth-city').hasValue('Trouville');
    });

    test('it should call the onFormSubmit action if all fields are filled', async function(assert) {
      // given
      this.candidate = EmberObject.create({ firstName: 'Fabrice', lastName: 'Gadjo', birthdate: '2000-12-15', birthplace: 'Trouville' });
      this.onFormSubmitStub = sinon.stub();
      await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}} @onFormSubmit={{this.onFormSubmitStub}}/>`);
      await fillInByLabel('Nom de famille', 'Belmans');
      await fillInByLabel('Prénom', 'Gideon');
      setFlatpickrDate('#birthdate', new Date('1861-03-17'));
      await fillInByLabel('Commune de naissance', 'Ormeshadow');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.ok(this.onFormSubmitStub.called);
      assert.equal(this.candidate.firstName, 'Gideon');
      assert.equal(this.candidate.lastName, 'Belmans');
      assert.equal(this.candidate.birthdate, '1861-03-17');
      assert.equal(this.candidate.birthplace, 'Ormeshadow');
    });
  });

  test('it should display candidate information to edit', async function(assert) {
    // given
    this.candidate = EmberObject.create({
      firstName: 'Quentin',
      lastName: 'Lebouc',
      birthdate: '2000-12-15',
      birthplace: 'Saint-Malo',
    });

    // when
    await render(hbs`<Certification::CandidateEditModal @isDisplayed={{true}} @candidate={{candidate}}  />`);

    // then
    assert.dom('#first-name').hasValue('Quentin');
    assert.dom('#last-name').hasValue('Lebouc');
    assert.dom('#birthdate').hasValue('2000-12-15');
    assert.dom('#birth-city').hasValue('Saint-Malo');
  });
});
