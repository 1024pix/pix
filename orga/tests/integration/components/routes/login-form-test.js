import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject, resolve } from 'rsvp';

const errorMessages = {
  NOT_LINKED_ORGANIZATION_MSG: 'Vous ne pouvez pas vous connecter à PixOrga car vous n’êtes rattaché à aucune organisation. Contactez votre administrateur qui pourra vous inviter.',
  INVALID_CREDENTIEL_MSG: 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.'
};

module('Integration | Component | routes/login-form', function(hooks) {
  setupRenderingTest(hooks);

  let sessionStub;
  let storeStub;

  hooks.beforeEach(function() {
    sessionStub = Service.extend({});
    storeStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
    this.owner.unregister('service:store');
    this.owner.register('service:store', storeStub);
  });

  test('it should ask for email and password', async function(assert) {
    // when
    await render(hbs`{{routes/login-form}}`);

    // then
    assert.dom('#login-email').exists();
    assert.dom('#login-password').exists();
  });

  test('it should not display error message', async function(assert) {
    // when
    await render(hbs`{{routes/login-form}}`);

    // then
    assert.dom('#login-form-error-message').doesNotExist();
  });

  module('When there is no invitation', function(hooks) {

    hooks.beforeEach(function() {
      sessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should call authentication service with appropriate parameters', async function(assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`{{routes/login-form organizationInvitationId=1 organizationInvitationCode='C0D3'}}`);
      await fillIn('#login-email', 'pix@example.net');
      await fillIn('#login-password', 'JeMeLoggue1024');

      //  when
      await click('.button');

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'pix@example.net');
      assert.equal(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('When there is an invitation', function(hooks) {

    hooks.beforeEach(function() {
      storeStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          }
        });
      };
      sessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should be ok and call authentication service with appropriate parameters', async function(assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await render(hbs`{{routes/login-form isWithInvitation=true organizationInvitationId=1 organizationInvitationCode='C0D3'}}`);
      await fillIn('#login-email', 'pix@example.net');
      await fillIn('#login-password', 'JeMeLoggue1024');

      //  when
      await click('.button');

      // then
      assert.dom('.alert-input--error').doesNotExist();
      assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.equal(sessionServiceObserver.email, 'pix@example.net');
      assert.equal(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.equal(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  test('it should display an invalid credentiels message when authentication fails', async function(assert) {

    // given
    const msgErrorInvalidCredentiel =  {
      'errors' : [{ 'status' : '401', 'title' : 'Unauthorized' , 'detail' : errorMessages.INVALID_CREDENTIEL_MSG  }]
    };

    sessionStub.prototype.authenticate = () => reject(msgErrorInvalidCredentiel);

    await render(hbs`{{routes/login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'Mauvais mot de passe');

    //  when
    await click('.button');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(errorMessages.INVALID_CREDENTIEL_MSG);
  });

  test('it should display an not linked organisation message when authentication fails', async function(assert) {

    // given
    const msgErrorNotLinkedOrganization =  {
      'errors' : [{ 'status' : '401', 'title' : 'Unauthorized' , 'detail' : errorMessages.NOT_LINKED_ORGANIZATION_MSG }]
    };

    sessionStub.prototype.authenticate = () => reject(msgErrorNotLinkedOrganization);

    await render(hbs`{{routes/login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'pix123');

    //  when
    await click('.button');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(errorMessages.NOT_LINKED_ORGANIZATION_MSG);
  });

  module('when password is hidden', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      await render(hbs`{{routes/login-form}});`);
    });

    test('it should display password when user click', async function(assert) {
      // when
      await click('.input-password__icon');

      // then
      assert.dom('#login-password').hasAttribute('type', 'text');
    });

    test('it should change icon when user click on it', async function(assert) {
      // when
      await click('.input-password__icon');

      // then
      assert.dom('.fa-eye').exists();
    });

    test('it should not change icon when user keeps typing his password', async function(assert) {
      // given
      await fillIn('#login-password', 'début du mot de passe');

      // when
      await click('.input-password__icon');
      await fillIn('#login-password', 'fin du mot de passe');

      // then
      assert.dom('.fa-eye').exists();
    });
  });
});
