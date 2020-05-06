import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import Object from '@ember/object';
import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';

module('Integration | Component | password-reset-window', function(hooks) {

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
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2010-12-01',
        organization: run(() => store.createRecord('organization', {}))
      }));
    this.set('student', student);
  });

  module('Student with username authentication method', function() {

    hooks.beforeEach(function() {
      student.username = username;
      this.student = student;
    });

    test('should render component with username field', async function(assert) {
      // when
      await render(hbs`{{password-reset-window student=student}}`);

      // then
      assert.dom('.pix-modal-overlay').exists();
      assert.dom('#username').hasValue(username);
    });

    test('should render clipboard to copy username', async function(assert) {
      // when
      await render(hbs`{{password-reset-window student=student}}`);

      // then
      assert.dom('button[aria-label="Copier l\'identifiant"]').hasAttribute('data-clipboard-text', username);
      assert.dom('#username + .tooltip > .tooltip-text').hasText('Copier l\'identifiant');
    });

    test('should display tooltip when username copy button is clicked', async function(assert) {
      // given
      await render(hbs`{{password-reset-window student=student}}`);

      // when
      await triggerCopySuccess('button[aria-label="Copier l\'identifiant"]');

      // then
      assert.dom('#username + .tooltip').hasText('Copié !');
    });
  });

  module('Student with email authentication method', function() {

    hooks.beforeEach(function() {
      student.email = email;
      this.student = student;
    });

    test('should render component with email field', async function(assert) {
      // when
      await render(hbs`{{password-reset-window student=student}}`);

      // then
      assert.dom('.pix-modal-overlay').exists();
      assert.dom('#email').hasValue(email);
    });

    test('should render clipboard to copy email', async function(assert) {
      // when
      await render(hbs`{{password-reset-window student=student}}`);

      // then
      assert.dom('button[aria-label="Copier l\'adresse e-mail"]').hasAttribute('data-clipboard-text', email);
      assert.dom('#email + .tooltip > .tooltip-text').hasText('Copier l\'adresse e-mail');
    });

    test('should display tooltip when email copy button is clicked', async function(assert) {
      // given
      await render(hbs`{{password-reset-window student=student}}`);

      // when
      await triggerCopySuccess('button[aria-label="Copier l\'adresse e-mail"]');

      // then
      assert.dom('#email + .tooltip').hasText('Copié !');
    });
  });

  module('Unique password', function() {

    const generatedPassword = 'abcdef12';

    hooks.beforeEach(function() {
      const storeStub = Service.extend({
        createRecord: () => {
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
      // given
      await render(hbs`{{password-reset-window student=student}}`);

      // when
      await click('.pix-modal-footer div button');

      // then
      assert.dom('#generated-password').exists();
    });

    test('should render clipboard to copy unique password', async function(assert) {
      // given
      await render(hbs`{{password-reset-window student=student}}`);

      // when
      await click('.pix-modal-footer div button');

      // then
      assert.dom('button[aria-label="Copier le mot de passe unique"]').hasAttribute('data-clipboard-text', generatedPassword);
      assert.dom('#generated-password + .tooltip > .tooltip-text').hasText('Copier le mot de passe unique');
    });

    test('should display tooltip when generated password copy button is clicked', async function(assert) {
      // given
      await render(hbs`{{password-reset-window student=student}}`);
      await click('.pix-modal-footer div button');

      // when
      await triggerCopySuccess('button[aria-label="Copier le mot de passe unique"]');

      // then
      assert.dom('#generated-password + .tooltip').hasText('Copié !');
    });
  });

});
