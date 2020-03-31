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

describe('Unit | Controller | update-expired-password', () => {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:update-expired-password');
  });

  describe('#validatePassword', () => {

    it('should set validation status to default, when controller is used', () => {
      expect(controller.validation).to.deep.equal(VALIDATION_MAP['default']);
    });

    it('should set validation status to error, when there is an validation error on password field', () => {
      //given
      const wrongPassword = 'pix123';
      controller.newPassword = wrongPassword;

      // when
      controller.send('validatePassword');

      // then
      expect(controller.validation).to.deep.equal(VALIDATION_MAP['error']);
    });

    it('should set validation status to success, when password is valid', () => {
      //given
      const goodPassword = 'Pix12345';
      controller.newPassword = goodPassword;

      // when
      controller.send('validatePassword');

      // then
      expect(controller.validation).to.deep.equal(VALIDATION_MAP['default']);
    });
  });

  /*
  describe('#handleUpdatePassword', () => {

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

   */
});
