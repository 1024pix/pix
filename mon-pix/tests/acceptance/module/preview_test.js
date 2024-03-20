import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Module | Routes | Preview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('should allow to preview module', async function (assert) {
    // given & when
    const screen = await visit('/modules/preview');

    assert.strictEqual(currentURL(), '/modules/preview');

    await fillByLabel(
      'Contenu du Module',
      '{ "grains": [{ "id":"1", "type": "lesson", "title": "Preview", "elements": [{"type": "text", "content": "Preview du module" }] }] }',
    );

    // then
    assert.dom(screen.getByText('Preview du module')).exists();
  });
});
