import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import CertificationsStart from 'mon-pix/components/certifications/start';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | start', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays certification starter page when extension is enabled', async function (assert) {
    // given
    const model = {
      certificationCandidate: {},
    };

    // when
    const screen = await render(<template><CertificationsStart @model={{model}} /></template>);

    // then
    assert.dom(screen.queryByRole('heading', { level: 1, name: t('pages.certification-start.first-title') })).exists();
  });

  test('it displays companion blocker page when extension is disabled', async function (assert) {
    // given
    const startCheckingExtensionIsEnabledStub = sinon.stub();
    const stopCheckingExtensionIsEnabledStub = sinon.stub();

    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = startCheckingExtensionIsEnabledStub;
      stopCheckingExtensionIsEnabled = stopCheckingExtensionIsEnabledStub;
      isExtensionEnabled = false;
    }

    this.owner.register('service:pix-companion', PixCompanionStub);

    const model = {
      certificationCandidate: {},
    };

    // when
    const screen = await render(<template><CertificationsStart @model={{model}} /></template>);

    // then
    assert
      .dom(screen.queryByRole('heading', { level: 2, name: t('pages.certification-start.first-title') }))
      .doesNotExist();

    assert
      .dom(screen.queryByRole('heading', { level: 1, name: 'L’extension Pix Companionn’est pas détectée' }))
      .exists();
  });
});
