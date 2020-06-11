import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import Object from '@ember/object';
import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';
import faker from 'faker';

module('Integration | Component | password-reset-modal', function(hooks) {

  setupRenderingTest(hooks);

  let username;
  let email;
  let student;

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');
    username = 'john.doe0112';
    email = 'john.doe0112@example.net';
    student =
      run(() => store.createRecord('student', {
        id: 1,
        username,
        email,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2010-12-01',
        organization: run(() => store.createRecord('organization', {}))
      }));
    this.set('student', student);
    this.set('display', true);
    this.set('close', () => { this.set('display', false); });

    return render(hbs`<PasswordResetModal @display={{display}} @close={{close}} @student={{student}} />`);
  });

  module('Student with username authentication method', function() {
    test('should render component with username field', async function(assert) {
      assert.dom('#username').hasValue(username);
    });

    test('should render clipboard to copy username', async function(assert) {
      assert.dom('button[aria-label="Copier l\'identifiant"]').hasAttribute('data-clipboard-text', username);
      assert.contains('Copier l\'identifiant');
    });

    test('should display tooltip when username copy button is clicked', async function(assert) {
      await triggerCopySuccess('button[aria-label="Copier l\'identifiant"]');

      assert.dom('#username + .tooltip').hasText('Copié !');
    });
  });

  module('Student with email authentication method', function() {
    test('should render component with email field', async function(assert) {
      assert.dom('#email').hasValue(email);
    });

    test('should render clipboard to copy email', async function(assert) {
      assert.dom('button[aria-label="Copier l\'adresse e-mail"]').hasAttribute('data-clipboard-text', email);
      assert.contains('Copier l\'adresse e-mail');
    });

    test('should display tooltip when email copy button is clicked', async function(assert) {
      await triggerCopySuccess('button[aria-label="Copier l\'adresse e-mail"]');

      assert.contains('Copié !');
    });
  });

  module('Unique password', function() {

    let generatedPassword;

    hooks.beforeEach(function() {
      const storeStub = Service.extend({
        createRecord: () => {
          generatedPassword = faker.internet.password();
          return Object.create({
            save() {
              return resolve();
            },
            generatedPassword
          });
        }
      });
      this.owner.unregister('service:store');
      this.owner.register('service:store', storeStub);
    });

    test('should display unique password input when reset password button is clicked', async function(assert) {
      await click('.modal-footer div button');

      assert.dom('#generated-password').exists();
    });

    test('should render clipboard to copy unique password', async function(assert) {
      await click('.modal-footer div button');

      assert.dom('button[aria-label="Copier le mot de passe unique"]').hasAttribute('data-clipboard-text', generatedPassword);
      assert.contains('Copier le mot de passe unique');
    });

    test('should display tooltip when generated password copy button is clicked', async function(assert) {
      await click('.modal-footer div button');
      await triggerCopySuccess('button[aria-label="Copier le mot de passe unique"]');

      assert.contains('Copié !');
    });

    test('should generate unique password each time the modal is used', async function(assert) {
      await click('.modal-footer div button');
      const firstGeneratedPassword = this.element.querySelector('#generated-password').value;
      await click('[aria-label="Fermer la fenêtre"]');
      this.set('display', true);
      await click('.modal-footer div button');
      const secondGeneratedPassword = this.element.querySelector('#generated-password').value;

      assert.notEqual(firstGeneratedPassword, secondGeneratedPassword);
    });
  });

});
