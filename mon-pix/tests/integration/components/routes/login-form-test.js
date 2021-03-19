import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { click, fillIn, render, find } from '@ember/test-helpers';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | routes/login-form', function() {

  setupIntlRenderingTest();

  it('should ask for login and password', async function() {
    // when
    await render(hbs`<Routes::LoginForm/>`);

    // then
    expect(find('#login')).to.exist;
    expect(find('#password')).to.exist;
  });

  it('should not display error message', async function() {
    // when
    await render(hbs`<Routes::LoginForm/>`);

    // then
    expect(find('#login-form-error-message')).to.not.exist;
  });

  it('should display an error message when authentication fails', async function() {
    // given
    class SessionStub extends Service {
      authenticate = sinon.stub().rejects()
    }
    this.owner.register('service:session', SessionStub);

    //  when
    await render(hbs`<Routes::LoginForm/>`);
    await fillIn('#login', 'pix@example.net');
    await fillIn('#password', 'Mauvais mot de passe');
    await click('#submit-connexion');

    // then
    expect(find('#login-form-error-message')).to.exist;
    expect(find('#login-form-error-message').textContent).to.equal('L\'adresse e-mail ou l\'identifiant et/ou le mot de passe saisis sont incorrects');
  });

  it('should display password when user click', async function() {
    // when
    await render(hbs`<Routes::LoginForm/>`);
    await click('.form-textfield-icon__button');

    // then
    expect(find('#password').getAttribute('type')).to.equal('text');
  });

  it('should change icon when user click on it', async function() {
    // when
    await render(hbs`<Routes::LoginForm/>`);
    await click('.form-textfield-icon__button');

    // then
    expect(find('.fa-eye')).to.exist;
  });

  it('should not change icon when user keeps typing his password', async function() {
    // when
    await render(hbs`<Routes::LoginForm/>`);
    await fillIn('#password', 'début du mot de passe');
    await click('.form-textfield-icon__button');
    await fillIn('#password', 'fin du mot de passe');

    // then
    expect(find('.fa-eye')).to.exist;
  });

  context('when there is no invitation', function() {

    it('should call authentication service with appropriate parameters', async function() {
      // given
      class SessionStub extends Service {
        authenticate = sinon.stub().resolves()
      }
      this.owner.register('service:session', SessionStub);
      const sessionServiceObserver = this.owner.lookup('service:session');

      // when
      await render(hbs`<Routes::LoginForm/>`);
      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('#submit-connexion');

      // then
      expect(find('.form-textfield__input--error')).to.not.exist;
      sinon.assert.calledWith(sessionServiceObserver.authenticate, 'authenticator:oauth2', {
        login: 'pix@example.net',
        password: 'JeMeLoggue1024',
        scope: 'mon-pix',
      });
    });
  });

  context('when there is an invitation', function() {

    it('should be ok and call authentication service with appropriate parameters', async function() {
      // given
      class SessionStub extends Service {
        authenticate = sinon.stub().resolves()
      }
      this.owner.register('service:session', SessionStub);

      const sessionServiceObserver = this.owner.lookup('service:session');

      //  when
      await render(hbs`<Routes::LoginForm/>`);
      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('#submit-connexion');

      // then
      expect(find('.form-textfield__input--error')).to.not.exist;
      sinon.assert.calledWith(sessionServiceObserver.authenticate, 'authenticator:oauth2', {
        login: 'pix@example.net',
        password: 'JeMeLoggue1024',
        scope: 'mon-pix',
      });
    });
  });

  context('when password is a one time password', function() {

    it('should redirect to "update-expired-password" route', async function() {
      // given
      class StoreStub extends Service {
        createRecord = sinon.stub().resolves()
      }
      this.owner.register('service:store', StoreStub);

      class RouterStub extends Service {
        replaceWith = sinon.stub()
      }
      this.owner.register('service:router', RouterStub);

      const response = {
        responseJSON: {
          errors: [{ title: 'PasswordShouldChange' }],
        },
      };

      class SessionStub extends Service {
        authenticate = sinon.stub().rejects(response)
      }
      this.owner.register('service:session', SessionStub);

      const routerObserver = this.owner.lookup('service:router');

      // when
      await render(hbs`<Routes::LoginForm/>`);
      await fillIn('#login', 'pix@example.net');
      await fillIn('#password', 'Mauvais mot de passe');
      await click('#submit-connexion');

      // then
      sinon.assert.calledWith(routerObserver.replaceWith, 'update-expired-password');
    });
  });

  context('when external user IdToken exist', function() {

    const externalUserToken = 'ABCD';

    let addGarAuthenticationMethodToUserStub;

    beforeEach(function() {
      class StoreStub extends Service {
        createRecord = sinon.stub().resolves()
      }
      this.owner.register('service:store', StoreStub);

      class SessionStub extends Service {
        authenticate = sinon.stub().resolves();
        isAuthenticated = sinon.stub().returns(true);
        get = sinon.stub().returns(externalUserToken);
        invalidate = sinon.stub().resolves();
      }
      this.owner.register('service:session', SessionStub);

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
