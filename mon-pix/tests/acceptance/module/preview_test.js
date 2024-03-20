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

  module('when module preview feature toggle is disabled', function () {
    test('should redirect to index', async function (assert) {
      // given
      server.create('feature-toggle', {
        id: 0,
        isModulePreviewEnabled: false,
      });

      // when
      await visit('/module-preview');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when module preview feature toggle is enabled', function () {
    test('should allow to preview module', async function (assert) {
      // given
      server.create('feature-toggle', {
        id: 0,
        isModulePreviewEnabled: true,
      });

      // when
      const screen = await visit('/module-preview');

      assert.strictEqual(currentURL(), '/module-preview');

      await fillByLabel(
        'Module',
        '{ "grains": [{ "id":"1", "type": "lesson", "title": "Preview", "elements": [{"type": "text", "content": "Preview du module" }] }] }',
      );

      // then
      assert.dom(screen.getByText('Preview du module')).exists();
    });
  });
});
