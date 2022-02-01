import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | account-recovery/student-information-form', function () {
  setupTest();

  describe('#_isIneInaValid', function () {
    describe('when ine or ina is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = '';

        // when
        const result = component._isIneInaValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when ine or ina is invalid', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = 'ABCDE';

        // when
        const result = component._isIneInaValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when ine is valid', function () {
      it('should return true', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = '123456789AA';

        // when
        const result = component._isIneInaValid;

        // then
        expect(result).to.be.true;
      });
    });

    describe('when ina is valid', function () {
      it('should return true', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.ineIna = '1234567890B';

        // when
        const result = component._isIneInaValid;

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#isFormValid', function () {
    describe('when lastName is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.lastName = '';

        // when
        const result = component.isFormValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when firstName is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.firstName = '';

        // when
        const result = component.isFormValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when monthOfBirth is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.monthOfBirth = '';

        // when
        const result = component.isFormValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when dayOfBirth is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.dayOfBirth = '';

        // when
        const result = component.isFormValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when yearOfBirth is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.yearOfBirth = '';

        // when
        const result = component.isFormValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when form is valid', function () {
      it('should return true', function () {
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
        expect(result).to.be.true;
      });
    });
  });

  describe('#_isDayOfBirthValid', function () {
    describe('when dayOfBirth is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.dayOfBirth = '';

        // when
        const result = component._isDayOfBirthValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when dayOfBirth is valid', function () {
      it('should return true', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.dayOfBirth = '5';

        // when
        const result = component._isDayOfBirthValid;

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#_isMonthOfBirthValid', function () {
    describe('when monthOfBirth is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.monthOfBirth = '';

        // when
        const result = component._isMonthOfBirthValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when monthOfBirth is valid', function () {
      it('should return true', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.monthOfBirth = '5';

        // when
        const result = component._isMonthOfBirthValid;

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#_isYearOfBirthValid', function () {
    describe('when yearOfBirth is empty', function () {
      it('should return false', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.yearOfBirth = '';

        // when
        const result = component._isYearOfBirthValid;

        // then
        expect(result).to.be.false;
      });
    });

    describe('when yearOfBirth is valid', function () {
      it('should return true', function () {
        // given
        const component = createGlimmerComponent('component:account-recovery/student-information-form');
        component.yearOfBirth = '2000';

        // when
        const result = component._isYearOfBirthValid;

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#_formatBirthdate', function () {
    it('should return valid birthdate format', function () {
      // given
      const component = createGlimmerComponent('component:account-recovery/student-information-form');
      component.dayOfBirth = '2';
      component.monthOfBirth = '5';
      component.yearOfBirth = '2004';

      // when
      const result = component._formatBirthdate;

      // then
      expect(result).to.equal('2004-05-02');
    });
  });
});
