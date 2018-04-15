import { module, test, only } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | organization-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{organization-form}}`);

    // then
    assert.dom('.organization-form').exists();
  });

  only('should display error messages panel when one or multiple errors occurred', async function(assert) {
    // given
    const errorMessages = ['Erreur A', 'Erreur B', 'Erreur C'];
    this.set('errorMessages', errorMessages);

    // when
    await render(hbs`{{organization-form errorMessages=errorMessages}}`);

    // then
    assert.dom('.error-messages-panel').exists();
  });
});
