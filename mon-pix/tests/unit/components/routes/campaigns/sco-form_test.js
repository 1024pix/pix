import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createComponent from '../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../helpers/setup-intl';

module('Unit | Component | routes/campaigns/sco-form', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;
  let onSubmitStub;
  let eventStub;

  hooks.beforeEach(function () {
    onSubmitStub = sinon.stub();
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/sco-form', {
      onSubmit: onSubmitStub,
      campaignCode: 123,
    });
    component.currentUser = { user: {} };
  });

  module('#triggerInputDayValidation', function () {
    module('when dayOfBirth is invalid', function () {
      ['', ' ', '32', '0', '444', 'ee'].forEach(function (wrongDayOfBirth) {
        test(`should display an error when dayOfBirth is ${wrongDayOfBirth}`, async function (assert) {
          // when
          await component.actions.triggerInputDayValidation.call(component, 'dayOfBirth', wrongDayOfBirth);

          // then
          assert.strictEqual(component.validation.dayOfBirth, 'Votre jour de naissance n’est pas valide.');
        });
      });
    });

    module('when dayOfBirth is valid', function () {
      ['1', '01', '31'].forEach(function (validDayOfBirth) {
        test(`should not display an error when dayOfBirth is ${validDayOfBirth}`, async function (assert) {
          // when
          await component.actions.triggerInputDayValidation.call(component, 'dayOfBirth', validDayOfBirth);

          // then
          assert.strictEqual(component.validation.dayOfBirth, null);
        });
      });
    });
  });

  module('#triggerInputMonthValidation', function () {
    module('when monthOfBirth is invalid', function () {
      ['', ' ', '13', '0', '444', 'ee'].forEach(function (wrongMonthOfBirth) {
        test(`should display an error when monthOfBirth is ${wrongMonthOfBirth}`, async function (assert) {
          // when
          await component.actions.triggerInputMonthValidation.call(component, 'monthOfBirth', wrongMonthOfBirth);

          // then
          assert.strictEqual(component.validation.monthOfBirth, 'Votre mois de naissance n’est pas valide.');
        });
      });
    });

    module('when monthOfBirth is valid', function () {
      ['1', '01', '12'].forEach(function (validMonthOfBirth) {
        test(`should not display an error when monthOfBirth is ${validMonthOfBirth}`, async function (assert) {
          // when
          await component.actions.triggerInputMonthValidation.call(component, 'monthOfBirth', validMonthOfBirth);

          // then
          assert.strictEqual(component.validation.monthOfBirth, null);
        });
      });
    });
  });

  module('#triggerInputYearValidation', function () {
    module('when yearOfBirth is invalid', function () {
      ['', ' ', '1', '11', '100', '0000', '0001', '0011', '0111', '10000'].forEach(function (wrongYearOfBirth) {
        test(`should display an error when yearOfBirth is ${wrongYearOfBirth}`, async function (assert) {
          // when
          await component.actions.triggerInputYearValidation.call(component, 'yearOfBirth', wrongYearOfBirth);

          // then
          assert.strictEqual(component.validation.yearOfBirth, 'Votre année de naissance n’est pas valide.');
        });
      });
    });

    module('when yearOfBirth is valid', function () {
      ['1000', '9999'].forEach(function (validYearOfBirth) {
        test(`should not display an error when yearOfBirth is ${validYearOfBirth}`, async function (assert) {
          // when
          await component.actions.triggerInputYearValidation.call(component, 'yearOfBirth', validYearOfBirth);

          // then
          assert.strictEqual(component.validation.yearOfBirth, null);
        });
      });
    });
  });

  module('#triggerInputStringValidation', function () {
    module('when string is invalid', function () {
      ['', ' '].forEach(function (wrongString) {
        test(`should display an error when firstName is "${wrongString}"`, async function (assert) {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'firstName', wrongString);

          // then
          assert.strictEqual(component.validation.firstName, 'Votre prénom n’est pas renseigné.');
        });

        test(`should display an error when lastName is "${wrongString}"`, async function (assert) {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'lastName', wrongString);

          // then
          assert.strictEqual(component.validation.lastName, 'Votre nom n’est pas renseigné.');
        });
      });
    });

    module('when string is valid', function () {
      ['Robert', 'Smith'].forEach(function (validString) {
        test(`should not display an error when firstName is ${validString}`, async function (assert) {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'firstName', validString);

          // then
          assert.strictEqual(component.validation.firstName, null);
        });

        test(`should not display an error when lastName is ${validString}`, async function (assert) {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'lastName', validString);

          // then
          assert.strictEqual(component.validation.lastName, null);
        });
      });
    });
  });

  module('#isFormNotValid', function () {
    test('should be true if firstName is not valid', function (assert) {
      // given
      component.firstName = ' ';
      component.lastName = 'Smith';
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      assert.true(result);
    });

    test('should be true if lastName is not valid', function (assert) {
      // given
      component.firstName = 'Robert';
      component.lastName = '';
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '99999';

      // when
      const result = component.isFormNotValid;

      // then
      assert.true(result);
    });

    test('should be true if dayOfBirth is not valid', function (assert) {
      // given
      component.dayOfBirth = '99';
      component.monthOfBirth = '12';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      assert.true(result);
    });

    test('should be true if monthOfBirth is not valid', function (assert) {
      // given
      component.dayOfBirth = '15';
      component.monthOfBirth = '99';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      assert.true(result);
    });

    test('should be true if yearOfBirth is not valid', function (assert) {
      // given
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '99999';

      // when
      const result = component.isFormNotValid;

      // then
      assert.true(result);
    });

    test('should be false', function (assert) {
      // given
      component.firstName = 'Robert';
      component.lastName = 'Smith';
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      assert.false(result);
    });
  });

  module('#validateForm', function (hooks) {
    hooks.beforeEach(function () {
      component.firstName = 'Robert';
      component.lastName = 'Smith';
      component.dayOfBirth = '10';
      component.monthOfBirth = '10';
      component.yearOfBirth = '2000';
    });

    test('should prevent default handling of event', async function (assert) {
      // when
      await component.actions.validateForm.call(component, eventStub);

      // then
      sinon.assert.called(eventStub.preventDefault);
      assert.ok(true);
    });

    test('should call onSubmit action', async function (assert) {
      // when
      await component.actions.validateForm.call(component, eventStub);

      // then
      sinon.assert.calledWith(onSubmitStub, { firstName: 'Robert', lastName: 'Smith', birthdate: '2000-10-10' });
      assert.ok(true);
    });

    module('Errors', function (hooks) {
      hooks.beforeEach(function () {
        component.firstName = 'pix';
        component.lastName = 'aile';
        component.dayOfBirth = '10';
        component.monthOfBirth = '10';
        component.yearOfBirth = '1010';
      });

      test('should display an error on firstName', async function (assert) {
        // given
        component.firstName = ' ';

        // when
        await component.actions.validateForm.call(component, eventStub);

        // then
        assert.strictEqual(component.validation.firstName, 'Votre prénom n’est pas renseigné.');
      });

      test('should display an error on lastName', async function (assert) {
        // given
        component.lastName = '';

        // when
        await component.actions.validateForm.call(component, eventStub);

        // then
        assert.strictEqual(component.validation.lastName, 'Votre nom n’est pas renseigné.');
      });

      test('should display an error on dayOfBirth', async function (assert) {
        // given
        component.dayOfBirth = '99';

        // when
        await component.actions.validateForm.call(component, eventStub);

        // then
        assert.strictEqual(component.validation.dayOfBirth, 'Votre jour de naissance n’est pas valide.');
      });

      test('should display an error on monthOfBirth', async function (assert) {
        // given
        component.monthOfBirth = '99';

        // when
        await component.actions.validateForm.call(component, eventStub);

        // then
        assert.strictEqual(component.validation.monthOfBirth, 'Votre mois de naissance n’est pas valide.');
      });

      test('should display an error on yearOfBirth', async function (assert) {
        // given
        component.yearOfBirth = '99';

        // when
        await component.actions.validateForm.call(component, eventStub);

        // then
        assert.strictEqual(component.validation.yearOfBirth, 'Votre année de naissance n’est pas valide.');
      });
    });
  });
});
