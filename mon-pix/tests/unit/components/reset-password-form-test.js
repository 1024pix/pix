import { run } from '@ember/runloop';
import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

const VALIDATION_MAP = {
  default: {
    status: 'default',
    message: null,
  },
  error: {
    status: 'error',
    message: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.',
  },
};

describe('Unit | Component | reset password form', function() {

  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:reset-password-form');
  });

  describe('#validatePassword', () => {

    it('should set validation status to default, when component is rendered', function() {
      expect(component.get('validation')).to.eql(VALIDATION_MAP.default);
    });

    it('should set validation status to error, when there is an validation error on password field', function() {
      //given
      const passwordReset = { temporaryKey: 'key', password: 'Pix' };
      component.set('passwordReset', passwordReset);

      // when
      component.send('validatePassword');

      // then
      expect(component.get('validation')).to.eql(VALIDATION_MAP.error);
    });

    it('should set validation status to success, when password is valid', function() {
      //given
      const passwordReset = { temporaryKey: 'key', password: 'Pixou123' };
      component.set('passwordReset', passwordReset);

      // when
      component.send('validatePassword');

      // then
      expect(component.get('validation')).to.eql(VALIDATION_MAP.default);
    });

  });

  describe('#handleResetPassword', () => {

    const passwordReset = EmberObject.create({
      temporaryKey: 'key',
      password: 'Pixou123',
      save: () => resolve(),
    });

    describe('When user password is saved', () => {
      it('should update validation with success data', function() {
        // given
        component.set('passwordReset', passwordReset);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('validation')).to.eql(VALIDATION_MAP.default);
      });

      it('should update displaySuccessMessage', function() {
        // given
        component.set('passwordReset', passwordReset);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('displaySuccessMessage')).to.eql(true);
      });

    });

    describe('When user password saving fails', () => {

      it('should set validation on invalid password', function() {
        // given
        const detail = 'detail';
        const passwordReset = EmberObject.create({
          temporaryKey: 'key',
          password: 'Pix123',
          save: () => reject({ errors: [{ status: '422', detail }] }),
        });
        component.set('passwordReset', passwordReset);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('validation')).to.eql({ status: 'error', message: detail });
      });

      it('should set errorMessage on invalid temporaryKey', function() {
        // given
        const passwordReset = EmberObject.create({
          temporaryKey: 'key',
          password: 'Pix123',
          save: () => reject({ errors: [{ status: 401 }] }),
        });
        component.set('passwordReset', passwordReset);

        // when
        run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('errorMessage')).to.eql('Le lien que vous venez d\'utiliser n\'est plus valide. Merci de refaire une demande de réinitialisation de mot de passe.');
      });

    });

  });
});
