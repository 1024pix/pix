import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from '../test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Application', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('When there are no information banners', function () {
    test('it should not display any banner', async function (assert) {
      // given
      server.create('information-banner', 'withoutBanners', { id: 'pix-certif-local' });

      // when
      const screen = await visit(`/`);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });
  });

  module('When there is an information banner', function () {
    test('it should display it', async function (assert) {
      // given
      const banner = server.create('banner', {
        id: 'pix-certif-local:1',
        severity: 'info',
        message: '[en]some text[/en][fr]du texte[/fr]',
      });
      server.create('information-banner', { id: 'pix-certif-local', banners: [banner] });

      // when
      const screen = await visit(`/`);

      // then
      assert.dom(screen.getByRole('alert')).exists();
    });
  });
});
