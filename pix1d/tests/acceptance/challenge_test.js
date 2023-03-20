import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);

  test('displays challenge page', async function (assert) {
    // when
    const screen = await visit('/challenges/12');

    // then
    assert.dom(screen.getByText('Contenu du challenge n°12')).exists();
  });
});
