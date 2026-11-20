import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import DownloadTemplate from 'pix-admin/components/administration/download-template';
import ENV from 'pix-admin/config/environment';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering.js';
const accessToken = 'An access token';
module('Integration | Component | download-template', function (hooks) {
  setupIntlRenderingTest(hooks);

  let fileSaverStub;

  hooks.beforeEach(function () {
    class SessionService extends Service {
      data = { authenticated: { access_token: accessToken } };
    }
    class FileSaver extends Service {
      save = fileSaverStub;
    }
    this.owner.register('service:session', SessionService);
    this.owner.register('service:file-saver', FileSaver);

    fileSaverStub = sinon.stub();
  });

  test('should render yielded part', async function (assert) {
    // when
    const screen = await render(
      <template>
        <DownloadTemplate><span>Hello</span></DownloadTemplate>
      </template>,
    );

    assert.ok(screen.getByText('Hello'));
  });

  module('when user download template', function () {
    test('it calls fileSaver', async function (assert) {
      // when
      const screen = await render(
        <template><DownloadTemplate @url="/api/admin/organizations/add-organization-features/template" /></template>,
      );

      const button = await screen.getByRole('button', { name: t('common.actions.download-template'), exact: false });
      await click(button);

      // then
      sinon.assert.calledWithExactly(fileSaverStub, {
        url: `${ENV.APP.API_HOST}/api/admin/organizations/add-organization-features/template`,
        token: accessToken,
      });
      assert.ok(true);
    });
  });
});
