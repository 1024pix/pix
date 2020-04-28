import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import Object from '@ember/object';

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

  test('should display unique password input when reset password button is clicked', async function(assert) {
    // given
    const storeStub = Service.extend({
      createRecord: () => {
        return Object.create({
          save() {
            return resolve();
          }
        });
      }
    });
    this.owner.unregister('service:store');
    this.owner.register('service:store', storeStub);
    await render(hbs`{{password-reset-window student=student}}`);

    // when
    await click('.pix-modal-footer div button');

    // then
    assert.dom('#generated-password').exists();
  });
});
