import { render as renderScreen } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ScoForm from 'mon-pix/components/routes/organizations/sco-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/sco-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the rgpd legal notice', async function (assert) {
    // given & when
    const screen = await renderScreen(<template><ScoForm /></template>);

    // then
    assert.ok(screen.getByText(t('pages.join.rgpd-legal-notice')));
    assert.ok(screen.getByRole('link', { name: t('pages.join.rgpd-legal-notice-link') }));
  });
});
