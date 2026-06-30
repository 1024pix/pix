import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import LiveAlert from 'mon-pix/components/assessments/live-alert';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Assessments | live-alert', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('it displays challenge live alert', async function (assert) {
    // given
    const message = t('pages.challenge.live-alerts.companion.message');

    // when
    const screen = await render(<template><LiveAlert @message={{message}} /></template>);

    // then
    assert.dom(screen.getByText(message)).exists();
    assert.dom(screen.getByText(t('pages.challenge.live-alerts.waiting-information'))).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.challenge.live-alerts.refresh') })).exists();
  });

  test('it refreshes the page when clicking the refresh button', async function (assert) {
    // given
    const reloadStub = sinon.stub(Location, 'reload');
    const message = t('pages.challenge.live-alerts.companion.message');
    await render(<template><LiveAlert @message={{message}} /></template>);

    // when
    await clickByName(t('pages.challenge.live-alerts.refresh'));

    // then
    sinon.assert.calledOnce(reloadStub);
    assert.ok(true);
  });
});
