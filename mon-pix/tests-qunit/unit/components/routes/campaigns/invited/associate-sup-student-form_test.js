import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Component | routes/campaigns/invited/associate-sup-student-form', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;
  let storeStub;
  let eventStub;

  hooks.beforeEach(function () {
    const createSchoolingRegistrationUserAssociationStub = sinon.stub();

    storeStub = { createRecord: createSchoolingRegistrationUserAssociationStub };
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/invited/associate-sup-student-form', {
      campaignCode: 123,
    });
    component.store = storeStub;
  });

  module('#submit', function () {
    module('when form data are correct', function (hooks) {
      hooks.beforeEach(function () {
        component.studentNumber = 'F001';
        component.firstName = 'firstName';
        component.lastName = 'lastName';
        component.dayOfBirth = '01';
        component.monthOfBirth = '01';
        component.yearOfBirth = '2010';
      });

      test('call reconciliation for the schooling registration', function (assert) {
        // given
        const schoolingRegistration = { save: sinon.stub() };
        storeStub.createRecord
          .withArgs('schooling-registration-user-association', {
            id: `${component.args.campaignCode}_${component.lastName}`,
            studentNumber: component.studentNumber,
            firstName: component.firstName,
            lastName: component.lastName,
            birthdate: component.birthdate,
            campaignCode: component.args.campaignCode,
          })
          .returns(schoolingRegistration);

        // when
        component.actions.submit.call(component, eventStub);

        // then
        assert.expect(0);
        sinon.assert.calledOnce(schoolingRegistration.save);
      });
    });

    module('when form data have errors', function () {
      test('should display an error when student number is not correct', async function (assert) {
        // given
        component.studentNumber = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.equal(component.errors.studentNumber, 'Votre numéro étudiant n’est pas renseigné.');
      });

      test('should display an error when first name is not correct', async function (assert) {
        // given
        component.firstName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.equal(component.errors.firstName, 'Votre prénom n’est pas renseigné.');
      });

      test('should display an error when last name is not correct', async function (assert) {
        // given
        component.lastName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.equal(component.errors.lastName, 'Votre nom n’est pas renseigné.');
      });

      test('should display an error when day of birth is not correct', async function (assert) {
        // given
        component.dayOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.equal(component.errors.dayOfBirth, 'Votre jour de naissance n’est pas valide.');
      });

      test('should display an error when month of birth is not correct', async function (assert) {
        // given
        component.monthOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.equal(component.errors.monthOfBirth, 'Votre mois de naissance n’est pas valide.');
      });

      test('should display an error when year of birth is not correct', async function (assert) {
        // given
        component.yearOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.equal(component.errors.yearOfBirth, 'Votre année de naissance n’est pas valide.');
      });
    });
  });
});
