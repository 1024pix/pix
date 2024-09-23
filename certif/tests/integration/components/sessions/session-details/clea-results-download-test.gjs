import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import SessionDetailsCleaResultsDownload from 'pix-certif/components/sessions/session-details/clea-results-download';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | sessions | session-details | clea-results-download', function (hooks) {
  setupIntlRenderingTest(hooks, 'fr');

  module('when candidate acquired Clea', function () {
    test('it should display a button to download the candidate results', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionId = store.createRecord('session-management', {
        id: '123',
        hasSomeCleaAcquired: true,
        publishedAt: '2022-01-01',
      }).id;

      // when
      const screen = await render(<template><SessionDetailsCleaResultsDownload @sessionId={{sessionId}} /></template>);

      // then
      const pngDownloadLink = screen.getByRole('link', { name: t('pages.sessions.detail.panel-clea.link-text') });
      assert.dom(pngDownloadLink).hasAttribute('href', 'https://cleanumerique.org/');
    });
  });
});
