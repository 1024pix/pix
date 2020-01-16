import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import { click, fillIn, render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject, resolve } from 'rsvp';

describe('Integration | Component | routes/login-form', function() {
  setupRenderingTest();

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
          }
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
    sessionStub.prototype.authenticate = () => reject();
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
});
