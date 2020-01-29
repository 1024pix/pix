import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | user-logged-menu', function(hooks) {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    const givenCurrentUser = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
    });
    this.owner.register('service:current-user', Service.extend({ user: givenCurrentUser }));

    // when
    await render(hbs`{{user-logged-menu}}`);

    // then
    assert.ok(this.element.textContent.includes(givenCurrentUser.get('firstName')), 'Should contains firstName');
    assert.ok(this.element.textContent.includes(givenCurrentUser.get('lastName')), 'Should contains lastName');
  });
});
