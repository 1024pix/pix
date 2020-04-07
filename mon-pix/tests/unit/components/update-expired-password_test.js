import sinon from 'sinon';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';

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

describe('Unit | Component | Update Expired Password', () => {

  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:update-expired-password-form');
  });

  describe('#validatePassword', () => {

    it('should set validation status to default, when component is used', () => {
      expect(component.validation).to.deep.equal(VALIDATION_MAP['default']);
    });

    it('should set validation status to error, when there is an validation error on password field', () => {
      //given
      const wrongPassword = 'pix123';
      component.newPassword = wrongPassword;

      // when
      component.send('validatePassword');

      // then
      expect(component.validation).to.deep.equal(VALIDATION_MAP['error']);
    });

    it('should set validation status to success, when password is valid', () => {
      //given
      const goodPassword = 'Pix12345';
      component.newPassword = goodPassword;

      // when
      component.send('validatePassword');

      // then
      expect(component.validation).to.deep.equal(VALIDATION_MAP['default']);
    });
  });

  describe('#handleUpdatePasswordAndAuthenticate', () => {

    const username = 'username.123';
    const expiredPassword = 'Pix12345';
    const newPassword = 'Pix67890';
    const scope = 'mon-pix';

    beforeEach(() => {
      const sessionStub = Service.create({
        authenticate: sinon.stub().resolves()
      });

      const userToSave = {
        username,
        password: expiredPassword,
        save: sinon.stub().resolves(),
        unloadRecord: sinon.stub().resolves()
      };

      component.session = sessionStub;
      component.user = userToSave;
      component.newPassword = newPassword;
    });

    describe('When user password is saved', () => {

      it('should update validation with success data', async () => {
        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.validation).to.deep.equal(SUBMISSION_MAP['default']);
      });

      it('should remove user password from the store', async () => {
        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        sinon.assert.called(component.user.unloadRecord);
      });

      it('should authenticate with username and newPassword', async () => {
        // given
        const expectedAuthenticator = 'authenticator:oauth2';
        const expectedParameters = {
          login: username,
          password: newPassword,
          scope
        };

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        sinon.assert.calledWith(component.session.authenticate, expectedAuthenticator, expectedParameters);
      });
    });

    describe('When update password is rejected by api', () => {

      it('should set validation with errors data', async () => {
        // given
        component.user.save.rejects();

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.validation).to.deep.equal(SUBMISSION_MAP['error']);
      });

    });

    describe('When authentication after update fails', () => {
      it('should set authenticationHasFailed to true', async () => {
        // given
        const response = {
          errors: [ { status: '500' } ]
        };
        component.session.authenticate.rejects(response);

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.authenticationHasFailed).to.equal(true);
      });
    });
  });
});
