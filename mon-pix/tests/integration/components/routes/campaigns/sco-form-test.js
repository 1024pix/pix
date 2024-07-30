import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/sco-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the rgpd legal notice', async function (assert) {
    // given & when
    const screen = await renderScreen(hbs`<Routes::Campaigns::ScoForm />`);

    // then
    assert.ok(screen.getByText(this.intl.t('pages.join.rgpd-legal-notice')));
    assert.ok(screen.getByRole('link', { name: this.intl.t('pages.join.rgpd-legal-notice-link') }));
  });
});
