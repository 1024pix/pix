import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import GlobalLevelGauge from 'mon-pix/components/certifications/certificate-information/global-level-gauge';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certificate information | global level gauge', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it labels the gauge with the reached level', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certification = store.createRecord('certification', {
      globalLevelLabel: 'Expert 1',
      level: '7',
    });

    // when
    const screen = await render(<template><GlobalLevelGauge @certificate={{certification}} /></template>);

    // then
    assert
      .dom(
        screen.getByRole('progressbar', {
          name: t('pages.certificate.global.progress-bar-explanation.default', {
            level: certification.level,
            globalLevelLabel: certification.globalLevelLabel,
          }),
        }),
      )
      .exists();
  });

  test('it labels the gauge with the pre-beginner label when no level is reached', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certification = store.createRecord('certification', {});

    // when
    const screen = await render(<template><GlobalLevelGauge @certificate={{certification}} /></template>);

    // then
    assert
      .dom(
        screen.getByRole('progressbar', {
          name: t('pages.certificate.global.progress-bar-explanation.pre-beginner-level'),
        }),
      )
      .exists();
  });
});
