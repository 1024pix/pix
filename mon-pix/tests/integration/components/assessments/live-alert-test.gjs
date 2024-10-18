import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LiveAlert from 'mon-pix/components/assessments/live-alert';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Assessments | live-alert', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays challenge live alert', async function (assert) {
    // given
    const assessment = {
      reload: sinon.stub(),
    };
    const message = t('pages.challenge.live-alerts.companion.message');

    // when
    const screen = await render(<template><LiveAlert @assessment={{assessment}} @message={{message}} /></template>);

    // then
    assert.dom(screen.getByText(message)).exists();
    assert.dom(screen.getByText(t('pages.challenge.live-alerts.waiting-information'))).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.challenge.live-alerts.refresh') })).exists();
  });

  module('when user clicks refresh button', function () {
    test('it should reload assessment', async function (assert) {
      // given
      const assessment = {
        reload: sinon.stub(),
      };
      const screen = await render(<template><LiveAlert @assessment={{assessment}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.challenge.live-alerts.refresh') }));

      // then
      sinon.assert.calledOnce(assessment.reload);
      assert.ok(true);
    });
  });
});
