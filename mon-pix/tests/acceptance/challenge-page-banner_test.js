import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Challenge page banner', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;
  let campaign;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { title: 'SomeTitle' });
    await authenticate(user);
  });

  module('When user is starting a campaign assessment', function () {
    test('should display a campaign banner', async function (assert) {
      // when
      const screen = await visit(`campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: 'Je commence' }));
      await click(screen.getByRole('button', { name: 'Ignorer' }));

      // then
      assert.dom(screen.getByRole('img', { name: 'pix' })).exists();
      assert.dom(screen.getByRole('link', { name: 'Quitter' })).exists();
    });

    test('should display accessibility information in the banner', async function (assert) {
      // given
      server.create('campaign-participation', { campaign, user, isShared: false, createdAt: Date.now() });

      // when
      const screen = await visit(`campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: 'Ignorer' }));

      // then
      assert.dom(screen.getByRole('heading', { name: "Épreuve pour l'évaluation : SomeTitle", level: 1 })).exists();
    });
  });
});
