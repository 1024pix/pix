import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | publish-session-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders Publier', async function(assert) {
    // given / when
    await render(hbs`<PublishSessionButton />`);

    // then
    assert.contains('Publier');
  });
});
