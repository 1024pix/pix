import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render, triggerEvent } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

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

    test('should render component with username field', async function(assert) {

      //Given
      student.username = username;
      this.set('student', student);

      // when
      await render(hbs`{{password-reset-window student=student}}`);

      // then
      assert.dom('.pix-modal-overlay').exists();
      assert.dom('#username').hasValue(username);
    });
  });

  module('Student with email authentication method', function() {

    test('should render component with email field', async function(assert) {

      //Given
      student.email = email;
      this.set('student', student);

      // when
      await render(hbs`{{password-reset-window student=student}}`);

      // then
      assert.dom('.pix-modal-overlay').exists();
      assert.dom('#email').hasValue(email);
    });
  });

  module('errors management', function() {

    [' ', 'password', 'password1', 'Password'].forEach(function(wrongPassword) {

      test(`it should display an error message on password field, when '${wrongPassword}' is typed and focused out`, async function(assert) {
        // given
        await render(hbs`{{password-reset-window student=student}}`);

        // when
        await fillIn('#update-password', wrongPassword);
        await triggerEvent('#update-password', 'focusout');

        // then
        assert.dom('.alert-input--error').hasText(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
        assert.dom('.input-password--error').exists();
      });
    });
  });

});
