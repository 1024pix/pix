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
    storeStub = { createRecord: sinon.stub() };
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

      test('call reconciliation for the sup organization learner', async function (assert) {
        // given
        const supOrganizationLearner = { save: sinon.stub(), unloadRecord: sinon.stub() };
        storeStub.createRecord
          .withArgs('sup-organization-learner', {
            id: `${component.args.campaignCode}_${component.lastName}`,
            studentNumber: component.studentNumber,
            firstName: component.firstName,
            lastName: component.lastName,
            birthdate: component.birthdate,
            campaignCode: component.args.campaignCode,
          })
          .returns(supOrganizationLearner);

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledOnce(supOrganizationLearner.save);
        assert.ok(true);
      });
    });

    module('when form data have errors', function () {
      test('should display an error when student number is not correct', async function (assert) {
        // given
        component.studentNumber = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.strictEqual(component.errors.studentNumber, 'Votre numéro étudiant n’est pas renseigné.');
      });

      test('should display an error when first name is not correct', async function (assert) {
        // given
        component.firstName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.strictEqual(component.errors.firstName, 'Votre prénom n’est pas renseigné.');
      });

      test('should display an error when last name is not correct', async function (assert) {
        // given
        component.lastName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.strictEqual(component.errors.lastName, 'Votre nom n’est pas renseigné.');
      });

      test('should display an error when day of birth is not correct', async function (assert) {
        // given
        component.dayOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.strictEqual(component.errors.dayOfBirth, 'Votre jour de naissance n’est pas valide.');
      });

      test('should display an error when month of birth is not correct', async function (assert) {
        // given
        component.monthOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.strictEqual(component.errors.monthOfBirth, 'Votre mois de naissance n’est pas valide.');
      });

      test('should display an error when year of birth is not correct', async function (assert) {
        // given
        component.yearOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        assert.strictEqual(component.errors.yearOfBirth, 'Votre année de naissance n’est pas valide.');
      });
    });
  });
});
