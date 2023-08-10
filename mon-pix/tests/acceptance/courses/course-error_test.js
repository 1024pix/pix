import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Course error screen', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should display the error page when course is not found', async function (assert) {
    // when
    const screen = await visit('/courses/COUCOU');

    // then
    assert.dom(screen.getByText('Oups, la page demandée n’est pas accessible.')).exists();
  });
});
