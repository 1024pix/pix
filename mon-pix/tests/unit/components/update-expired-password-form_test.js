import sinon from 'sinon';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { setupTest } from 'ember-mocha';
import Service from '@ember/service';

import setupIntl from '../../helpers/setup-intl';

const ERROR_PASSWORD_MESSAGE = 'pages.update-expired-password.fields.error';

const VALIDATION_MAP = {
  default: {
    status: 'default',
    message: null,
  },
  error: {
    status: 'error',
    message: ERROR_PASSWORD_MESSAGE,
  },
};

describe('Unit | Component | Update Expired Password Form', function () {
  setupTest();
  setupIntl();

  let component;

  beforeEach(function () {
    component = this.owner.lookup('component:update-expired-password-form');
  });

  describe('#validatePassword', function () {
    it('should set validation status to default, when component is used', function () {
      expect(component.validation).to.deep.equal(VALIDATION_MAP.default);
    });

    it('should set validation status to error, when there is an validation error on password field', function () {
      //given
      const wrongPassword = 'pix123';
      component.newPassword = wrongPassword;

      // when
      component.send('validatePassword');

      // then
      expect(component.validation).to.deep.equal(VALIDATION_MAP.error);
    });

    it('should set validation status to success, when password is valid', function () {
      //given
      const goodPassword = 'Pix12345';
      component.newPassword = goodPassword;

      // when
      component.send('validatePassword');

      // then
      expect(component.validation).to.deep.equal(VALIDATION_MAP.default);
    });
  });

  describe('#handleUpdatePasswordAndAuthenticate', function () {
    const login = 'beth.rave1203';
    const newPassword = 'Pix67890';
    const scope = 'mon-pix';

    beforeEach(() => {
      const sessionStub = Service.create({
        authenticate: sinon.stub().resolves(),
      });

      const resetExpiredPasswordDemand = {
        unloadRecord: sinon.stub().resolves(),
        updateExpiredPassword: sinon.stub().resolves(login),
      };

      component.session = sessionStub;
      component.resetExpiredPasswordDemand = resetExpiredPasswordDemand;
      component.newPassword = newPassword;
    });

    describe('When user password is saved', function () {
      it('should update validation with success data', async function () {
        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.validation).to.deep.equal(VALIDATION_MAP.default);
      });

      it('should remove user password from the store', async function () {
        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        sinon.assert.called(component.resetExpiredPasswordDemand.unloadRecord);
      });

      it('should authenticate with username and newPassword', async function () {
        // given
        const expectedAuthenticator = 'authenticator:oauth2';
        const expectedParameters = {
          login,
          password: newPassword,
          scope,
        };

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        sinon.assert.calledWith(component.session.authenticate, expectedAuthenticator, expectedParameters);
      });
    });

    describe('When update password is rejected by api', function () {
      it('should set validation with errors data if http 400 error', async function () {
        // given
        const response = {
          errors: [{ status: '400' }],
        };
        component.resetExpiredPasswordDemand.updateExpiredPassword.rejects(response);

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.validation).to.deep.equal(VALIDATION_MAP.error);
      });

      it('should set error message if http 401 error', async function () {
        // given
        const expectedErrorMessage = component.intl.t('api-error-messages.login-unauthorized-error');
        const response = {
          errors: [{ status: '401' }],
        };
        component.resetExpiredPasswordDemand.updateExpiredPassword.rejects(response);

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.errorMessage).to.equal(expectedErrorMessage);
      });

      it('should set validation with errors data', async function () {
        // given
        const expectedErrorMessage = component.intl.t('api-error-messages.internal-server-error');
        component.resetExpiredPasswordDemand.updateExpiredPassword.rejects();

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.errorMessage).to.equal(expectedErrorMessage);
      });
    });

    describe('When authentication after update fails', function () {
      it('should set authenticationHasFailed to true', async function () {
        // given
        component.session.authenticate.rejects();

        // when
        await component.actions.handleUpdatePasswordAndAuthenticate.call(component);

        // then
        expect(component.authenticationHasFailed).to.equal(true);
      });
    });
  });
});
