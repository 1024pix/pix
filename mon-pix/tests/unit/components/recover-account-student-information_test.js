import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | account-recovery/student-information-form', function (hooks) {
  setupTest(hooks);

  module('#_isIneInaValid', function () {
    module('when ine or ina is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = '';

        // when
        const result = component._isIneInaValid;

        // then
        assert.false(result);
      });
    });

    module('when ine or ina is invalid', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = 'ABCDE';

        // when
        const result = component._isIneInaValid;

        // then
        assert.false(result);
      });
    });

    module('when ine is valid', function () {
      test('should return true', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = '123456789AA';

        // when
        const result = component._isIneInaValid;

        // then
        assert.true(result);
      });
    });

    module('when ina is valid', function () {
      test('should return true', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = '1234567890B';

        // when
        const result = component._isIneInaValid;

        // then
        assert.true(result);
      });
    });
  });

  module('#isFormValid', function () {
    module('when lastName is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.lastName = '';

        // when
        const result = component.isFormValid;

        // then
        assert.false(result);
      });
    });

    module('when firstName is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.firstName = '';

        // when
        const result = component.isFormValid;

        // then
        assert.false(result);
      });
    });

    module('when monthOfBirth is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.monthOfBirth = '';

        // when
        const result = component.isFormValid;

        // then
        assert.false(result);
      });
    });

    module('when dayOfBirth is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.dayOfBirth = '';

        // when
        const result = component.isFormValid;

        // then
        assert.false(result);
      });
    });

    module('when yearOfBirth is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.yearOfBirth = '';

        // when
        const result = component.isFormValid;

        // then
        assert.false(result);
      });
    });

    module('when form is valid', function () {
      test('should return true', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.yearOfBirth = '2000';
        component.monthOfBirth = '05';
        component.dayOfBirth = '15';
        component.lastName = 'Lagaffe';
        component.firstName = 'Gaston';
        component.ineIna = '123456789BB';

        // when
        const result = component.isFormValid;

        // then
        assert.true(result);
      });
    });
  });

  module('#_isDayOfBirthValid', function () {
    module('when dayOfBirth is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.dayOfBirth = '';

        // when
        const result = component._isDayOfBirthValid;

        // then
        assert.false(result);
      });
    });

    module('when dayOfBirth is valid', function () {
      test('should return true', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.dayOfBirth = '5';

        // when
        const result = component._isDayOfBirthValid;

        // then
        assert.true(result);
      });
    });
  });

  module('#_isMonthOfBirthValid', function () {
    module('when monthOfBirth is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.monthOfBirth = '';

        // when
        const result = component._isMonthOfBirthValid;

        // then
        assert.false(result);
      });
    });

    module('when monthOfBirth is valid', function () {
      test('should return true', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.monthOfBirth = '5';

        // when
        const result = component._isMonthOfBirthValid;

        // then
        assert.true(result);
      });
    });
  });

  module('#_isYearOfBirthValid', function () {
    module('when yearOfBirth is empty', function () {
      test('should return false', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.yearOfBirth = '';

        // when
        const result = component._isYearOfBirthValid;

        // then
        assert.false(result);
      });
    });

    module('when yearOfBirth is valid', function () {
      test('should return true', function (assert) {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.yearOfBirth = '2000';

        // when
        const result = component._isYearOfBirthValid;

        // then
        assert.true(result);
      });
    });
  });

  module('#_formatBirthdate', function () {
    test('should return valid birthdate format', function (assert) {
      // given
      const component = createGlimmerComponent('component:account-recovery/student-information-form');
      component.dayOfBirth = '2';
      component.monthOfBirth = '5';
      component.yearOfBirth = '2004';

      // when
      const result = component._formatBirthdate;

      // then
      assert.strictEqual(result, '2004-05-02');
    });
  });
});
