import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import DownloadSessionResults from 'mon-pix/components/download-session-results';
import ENV from 'mon-pix/config/environment';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | download-session-results', function (hooks) {
  setupIntlRenderingTest(hooks);

  let fileSaver;

  hooks.beforeEach(function () {
    fileSaver = this.owner.lookup('service:file-saver');
    sinon.stub(fileSaver, 'save');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('should display component', async function (assert) {
    // given
    // when
    const screen = await render(<template><DownloadSessionResults /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: t('pages.download-session-results.title'), level: 1 })).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.download-session-results.button.label') })).exists();
  });

  test('should display the invalid token error message', async function (assert) {
    // given
    fileSaver.save.rejects({ status: '400', code: 'INVALID_SESSION_RESULT_TOKEN' });

    // when
    const screen = await render(<template><DownloadSessionResults /></template>);
    const downloadButton = screen.getByRole('button', { name: t('pages.download-session-results.button.label') });
    await click(downloadButton);

    // then
    assert.dom(screen.getByText(t('pages.download-session-results.errors.invalid-token'))).exists();
  });

  test('should trigger the download', async function (assert) {
    // given
    fileSaver.save.resolves();
    const tokenHash = 'mytoken';
    sinon.stub(Location, 'getHref').returns(`https://test.pix.fr#${tokenHash}`);

    // when
    const screen = await render(<template><DownloadSessionResults /></template>);
    const downloadButton = screen.getByRole('button', { name: t('pages.download-session-results.button.label') });
    await click(downloadButton);

    // then
    sinon.assert.calledWith(fileSaver.save, {
      url: `${ENV.APP.API_HOST}/api/sessions/download-all-results`,
      options: {
        method: 'POST',
        body: { token: tokenHash },
      },
    });
    assert.ok(true);
  });
});
