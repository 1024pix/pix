import { render } from '@1024pix/ember-testing-library';
import SessionDetailsControlsLinks from 'pix-certif/components/sessions/session-details/controls-links';
import { t } from 'pix-certif/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | sessions | session-details | controls-links', function (hooks) {
  setupIntlRenderingTest(hooks, 'fr');

  test('it should display links and buttons', async function (assert) {
    // given
    // when
    const screen = await render(
      <template>
        <SessionDetailsControlsLinks
          @urlToDownloadSessionIssueReportSheet='link'
          @shouldDisplayDownloadButton={{true}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('link', {
          name: `${t('pages.sessions.detail.downloads.fraud.extra-information')}`,
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByRole('button', {
          name: `${t('pages.sessions.detail.downloads.invigilator-kit.extra-information')}`,
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByRole('link', {
          name: `${t('pages.sessions.detail.downloads.incident-report.extra-information')}`,
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByRole('button', {
          name: `${t('pages.sessions.detail.downloads.attendance-sheet.extra-information')}`,
        }),
      )
      .exists();
  });
});
