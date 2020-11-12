import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';
import faker from 'faker';

module('Integration | Component | manage-authentication-method-modal', function(hooks) {

  setupRenderingTest(hooks);

  module('When Student is not connected with GAR method', function(hooks) {

    const username = 'john.doe0112';
    const email = 'john.doe0112@example.net';

    hooks.beforeEach(function() {
      this.studentWithUsernameAndEmail = EmberObject.create({
        id: 1,
        username,
        email,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2010-12-01',
        isAuthenticatedFromGar: false,
        hasUsername: true,
        hasEmail: true,
      });
      this.studentWithEmailOnly = EmberObject.create({
        id: 1,
        username,
        email,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2010-12-01',
        isAuthenticatedFromGar: false,
        hasUsername: false,
        hasEmail: true,
        displayAddUsernameAuthentication: true,
      });

      this.display = true;
    });

    module('When Student is connected with username method', function() {

      test('should render component with username field', async function(assert) {
        // when
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // then
        assert.dom('#username').hasValue(username);
      });

      test('should render clipboard to copy username', async function(assert) {
        // when
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // then
        assert.dom('button[aria-label="Copier l\'identifiant"]').hasAttribute('data-clipboard-text', username);
        assert.contains('Copier l\'identifiant');
      });

      test('should display tooltip when username copy button is clicked', async function(assert) {
        // given
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // when
        await triggerCopySuccess('button[aria-label="Copier l\'identifiant"]');

        // then
        assert.dom('#username + .tooltip').hasText('Copié !');
      });
    });

    module('When Student is connected with email and username method', function() {

      test('should render component with email field', async function(assert) {
        // when
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // then
        assert.dom('#email').hasValue(email);
      });

      test('should render clipboard to copy email', async function(assert) {
        // when
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // then
        assert.dom('button[aria-label="Copier l\'adresse e-mail"]').hasAttribute('data-clipboard-text', email);
        assert.contains('Copier l\'adresse e-mail');
      });

      test('should display tooltip when email copy button is clicked', async function(assert) {
        // given
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // when
        await triggerCopySuccess('button[aria-label="Copier l\'adresse e-mail"]');

        // then
        assert.contains('Copié !');
      });
    });

    module('When Student is connected with email only', function() {

      test('should render add username authentication method', async function(assert) {
        // when
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithEmailOnly}} @display={{this.display}} />`);

        // then
        assert.dom('#email').hasValue(email);
        assert.contains('Ajouter une connexion avec un identifiant');
      });
    });

    module('When password is generated', function() {

      let generatedPassword;

      hooks.beforeEach(function() {
        class StoreStub extends Service {
          createRecord() {
            generatedPassword = faker.internet.password();
            return EmberObject.create({
              save() {
                return resolve();
              },
              generatedPassword,
            });
          }
        }
        this.owner.unregister('service:store');
        this.owner.register('service:store', StoreStub);
      });

      test('should display unique password input when reset password button is clicked', async function(assert) {
        // given
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // when
        await click('#generate-password');

        // then
        assert.dom('#generated-password').exists();
      });

      test('should render clipboard to copy unique password', async function(assert) {
        // given
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // when
        await click('#generate-password');

        // then
        assert.dom('button[aria-label="Copier le mot de passe unique"]').hasAttribute('data-clipboard-text', generatedPassword);
        assert.contains('Copier le mot de passe unique');
      });

      test('should display tooltip when generated password copy button is clicked', async function(assert) {
        // given
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);

        // when
        await click('#generate-password');
        await triggerCopySuccess('button[aria-label="Copier le mot de passe unique"]');

        // then
        assert.contains('Copié !');
      });

      test('should generate unique password each time the modal is used', async function(assert) {
        // given
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);
        await click('#generate-password');
        const firstGeneratedPassword = this.element.querySelector('#generated-password').value;

        // when
        await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentWithUsernameAndEmail}} @display={{this.display}} />`);
        await click('#generate-password');
        const secondGeneratedPassword = this.element.querySelector('#generated-password').value;

        // then
        assert.notEqual(firstGeneratedPassword, secondGeneratedPassword);
      });
    });
  });

  module('When Student is connected with GAR method', function() {

    hooks.beforeEach(function() {
      this.studentGAR = EmberObject.create({
        id: 2,
        isAuthenticatedFromGar: true,
        displayAddUsernameAuthentication: true,
      });
      this.display = true;
    });

    test('should render component with GAR connection method', async function(assert) {
      // when
      await render(hbs`<ManageAuthenticationMethodModal @student={{this.studentGAR}} @display={{this.display}} />`);

      // then
      assert.contains('Connecté avec Médiacentre');
      assert.contains('Ajouter une connexion avec un identifiant');

    });
  });

});
