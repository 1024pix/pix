import { run } from '@ember/runloop';
import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

const ERROR_PASSWORD_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

const VALIDATION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

const SUBMISSION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

describe('Unit | Component | reset password form', function() {

  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:reset-password-form');
  });

  describe('#validatePassword', () => {

    it('should set validation status to default, when component is rendered', function() {
      expect(component.get('validation')).to.eql(VALIDATION_MAP['default']);
    });

    it('should set validation status to error, when there is an validation error on password field', function() {
      //given
      const userWithBadPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix' };
      component.set('user', userWithBadPassword);

      // when
      component.send('validatePassword');

      // then
      expect(component.get('validation')).to.eql(VALIDATION_MAP['error']);
    });

    it('should set validation status to success, when password is valid', function() {
      //given
      const userWithGoodPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix123 0 #' };
      component.set('user', userWithGoodPassword);

      // when
      component.send('validatePassword');

      // then
      expect(component.get('validation')).to.eql(VALIDATION_MAP['default']);
    });

  });

  describe('#handleResetPassword', () => {

    const userWithGoodPassword = EmberObject.create({
      firstName: 'toto',
      lastName: 'riri',
      password: 'Pix123 0 #',
      save: () => resolve()
    });

    describe('When user password is saved', () => {
      it('should update validation with success data', function() {
        // given
        component.set('user', userWithGoodPassword);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('validation')).to.eql(SUBMISSION_MAP['default']);
      });

      it('should update _displaySuccessMessage', function() {
        // given
        component.set('user', userWithGoodPassword);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('_displaySuccessMessage')).to.eql(true);
      });

      it('should reset paswword input', function() {
        // given
        component.set('user', userWithGoodPassword);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('user.password')).to.eql(null);
      });

    });

    describe('When user password saving fails', () => {

      it('should set validation with errors data', function() {
        // given
        const userWithBadPassword = EmberObject.create({
          firstName: 'toto',
          lastName: 'riri',
          password: 'Pix',
          save: () => reject()
        });
        component.set('user', userWithBadPassword);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('validation')).to.eql(SUBMISSION_MAP['error']);
      });
    });

  });
});
