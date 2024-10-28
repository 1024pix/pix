import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaigns::Presentation', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is no current user', function () {
    test('initial bahaviour', async function (assert) {
      //  when
      const screen = await render(hbs`<Campaigns::Presentation @campaignCode='CAMPAIGN1' />`);

      // then
      assert.strictEqual(screen.getAllByRole('img').length, 2);
      assert.dom(screen.getByText(/Bonjour !/)).exists();
      assert.dom(screen.getByRole('link', { name: t('pages.campaign.presentation.landing.start-button') })).exists();
    });
  });

  module('when a user is connected', function () {
    test('displays connected user content', async function (assert) {
      // given
      class currentUser extends Service {
        user = { firstName: 'Bobby', lastName: 'Bellamy' };
      }
      this.owner.register('service:currentUser', currentUser);

      //  when
      const screen = await render(hbs`<Campaigns::Presentation @campaignCode='CAMPAIGN1' />`);

      // then
      assert.dom(screen.getByText(/Bonjour Bobby !/)).exists();
      assert.dom(screen.getByRole('link', { name: t('pages.campaign.presentation.landing.start-button') })).exists();
      assert.dom(screen.getByText(/Vous n'êtes pas Bobby Bellamy ?/)).exists();
      assert.dom(screen.getByRole('link', { name: t('common.actions.sign-out') })).exists();
    });
  });
});
