/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { reject, resolve } from 'rsvp';

import { click, fillIn, render, find } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | routes/login-form', function() {

  setupIntlRenderingTest();

  let sessionStub;
  let storeStub;

  beforeEach(function() {
    sessionStub = Service.extend({});
    storeStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  it('should ask for login and password', async function() {
    // when
    await render(hbs`{{routes/login-form}}`);

    // then
    expect(find('#login')).to.exist;
    expect(find('#password')).to.exist;
  });

  it('should not display error message', async function() {
    // when
    await render(hbs`{{routes/login-form}}`);

    // then
    expect(find('#login-form-error-message')).to.not.exist;
  });

  context('When there is no invitation', function() {

    beforeEach(function() {
      sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
        this.authenticator = authenticator;
        this.login = login;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    it('should call authentication service with appropriate parameters', async function() {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`{{routes/login-form}}`);
      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');

      //  when
      await click('#submit-connexion');

      // then
      expect(find('.form-textfield__input--error')).to.not.exist;
      expect(sessionServiceObserver.authenticator).to.equal('authenticator:oauth2');
      expect(sessionServiceObserver.login).to.equal('pix@example.net');
      expect(sessionServiceObserver.password).to.equal('JeMeLoggue1024');
      expect(sessionServiceObserver.scope).to.equal('mon-pix');
    });
  });

  context('When there is an invitation', function() {

    beforeEach(function() {
      storeStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          },
        });
      };
      sessionStub.prototype.authenticate = function(authenticator, { login, password, scope }) {
        this.authenticator = authenticator;
        this.login = login;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    it('should be ok and call authentication service with appropriate parameters', async function() {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`{{routes/login-form}}`);
      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');

      //  when
      await click('#submit-connexion');

      // then
      expect(find('.form-textfield__input--error')).to.not.exist;
      expect(sessionServiceObserver.authenticator).to.equal('authenticator:oauth2');
      expect(sessionServiceObserver.login).to.equal('pix@example.net');
      expect(sessionServiceObserver.password).to.equal('JeMeLoggue1024');
      expect(sessionServiceObserver.scope).to.equal('mon-pix');
    });
  });

  it('should display an error message when authentication fails', async function() {
    // given
    sessionStub.prototype.authenticate = () => reject({});
    await render(hbs`{{routes/login-form}}`);
    await fillIn('#login', 'pix@example.net');
    await fillIn('#password', 'Mauvais mot de passe');

    //  when
    await click('#submit-connexion');

    // then
    expect(find('#login-form-error-message')).to.exist;
    expect(find('#login-form-error-message').textContent).to.equal('L\'adresse e-mail ou l\'identifiant et/ou le mot de passe saisis sont incorrects');
  });

  context('when password is hidden', function() {

    beforeEach(async function() {
      // given
      await render(hbs`{{routes/login-form}});`);
    });

    it('should display password when user click', async function() {
      // when
      await click('.form-textfield-icon__button');

      // then
      expect(find('#password').getAttribute('type')).to.equal('text');
    });

    it('should change icon when user click on it', async function() {
      // when
      await click('.form-textfield-icon__button');

      // then
      expect(find('.fa-eye')).to.exist;
    });

    it('should not change icon when user keeps typing his password', async function() {
      // given
      await fillIn('#password', 'début du mot de passe');

      // when
      await click('.form-textfield-icon__button');
      await fillIn('#password', 'fin du mot de passe');

      // then
      expect(find('.fa-eye')).to.exist;
    });
  });

  context('when password is a one time password', function() {

    let replaceWithStub;

    beforeEach(function() {
      storeStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          },
        });
      };

      replaceWithStub = sinon.stub();
      const router = Service.extend({
        replaceWith: replaceWithStub,
      });
      this.owner.register('service:router', router);
    });

    it('should redirect to "update-expired-password" route', async function() {
      // given
      const response = {
        responseJSON: {
          errors: [{ title: 'PasswordShouldChange' }],
        },
      };
      sessionStub.prototype.authenticate = () => reject(response);
      await render(hbs`{{routes/login-form}}`);
      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'Mauvais mot de passe');

      //  when
      await click('#submit-connexion');

      // then
      sinon.assert.calledWith(replaceWithStub, 'update-expired-password');
    });
  });

  context('when external user IdToken exist', function() {

    const externalUserToken = 'ABCD';

    let addGarAuthenticationMethodToUserStub;

    beforeEach(function() {
      storeStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          },
        });
      };

      sessionStub.prototype.authenticate = sinon.stub().resolves();
      sessionStub.prototype.isAuthenticated = sinon.stub().returns(true);
      sessionStub.prototype.get = sinon.stub().returns(externalUserToken);
      sessionStub.prototype.set = sinon.stub().resolves();
      sessionStub.prototype.invalidate = sinon.stub().resolves();

      addGarAuthenticationMethodToUserStub = sinon.stub();
    });

    it('should display the specific error message if update fails with http error 4xx', async function() {
      // given
      const expectedErrorMessage = 'Les données que vous avez soumises ne sont pas au bon format.';
      const apiReturn = {
        errors: [{
          status: 400,
          detail: expectedErrorMessage,
        }],
      };

      addGarAuthenticationMethodToUserStub.rejects(apiReturn);
      this.set('addGarAuthenticationMethodToUser', addGarAuthenticationMethodToUserStub);

      await render(hbs`<Routes::LoginForm @addGarAuthenticationMethodToUser={{this.addGarAuthenticationMethodToUser}} />`);

      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');

      // when
      await click('#submit-connexion');

      // then
      expect(find('#update-form-error-message').textContent).to.equal(expectedErrorMessage);
    });

    it('should display the default error message if update fails with other http error', async function() {
      // given
      const expectedErrorMessage = 'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';
      const apiReturn = {
        errors: [{
          status: 500,
          detail: expectedErrorMessage,
        }],
      };
      addGarAuthenticationMethodToUserStub.rejects(apiReturn);

      this.set('addGarAuthenticationMethodToUser', addGarAuthenticationMethodToUserStub);

      await render(hbs`<Routes::LoginForm @addGarAuthenticationMethodToUser={{this.addGarAuthenticationMethodToUser}} />`);

      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');

      // when
      await click('#submit-connexion');

      // then
      expect(find('#update-form-error-message').textContent).to.equal(expectedErrorMessage);
    });

    it('should display the specific error message if update fails with http error 409 and code UNEXPECTED_USER_ACCOUNT', async function() {
      // given
      const expectedErrorMessage = 'L\'adresse e-mail ou l\'identifiant est incorrect. Pour continuer, vous devez vous connecter à votre compte qui est sous la forme : t***@exmaple.net';
      const apiReturn = {
        errors: [{
          status: 409,
          detail: expectedErrorMessage,
          code: 'UNEXPECTED_USER_ACCOUNT',
          meta: {
            value: 't***@exmaple.net',
          },
        }],
      };

      addGarAuthenticationMethodToUserStub.rejects(apiReturn);
      this.set('addGarAuthenticationMethodToUser', addGarAuthenticationMethodToUserStub);

      await render(hbs`<Routes::LoginForm @addGarAuthenticationMethodToUser={{this.addGarAuthenticationMethodToUser}} />`);

      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');

      // when
      await click('#submit-connexion');

      // then
      expect(find('#update-form-error-message').textContent).to.equal(expectedErrorMessage);
    });
  });

});
