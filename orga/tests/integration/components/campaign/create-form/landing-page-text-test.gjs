import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import LandingPageText from 'pix-orga/components/campaign/create-form/landing-page-text';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::LandingPageText', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign');
  });

  test('it fills campaign landing page text', async function (assert) {
    // given
    data.campaign.customLandingPageText = 'Mon texte de landing page';

    // when
    const screen = await render(<template><LandingPageText @campaign={{data.campaign}} /></template>);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.landing-page-text.label'), { exact: false }))
      .hasValue('Mon texte de landing page');
  });

  test('it updates campaign.customLandingPageText on input', async function (assert) {
    // given
    await render(<template><LandingPageText @campaign={{data.campaign}} /></template>);

    // when
    await fillByLabel(t('pages.campaign-creation.landing-page-text.label'), 'Mon texte de landing page', {
      exact: false,
    });

    // then
    assert.strictEqual(data.campaign.customLandingPageText, 'Mon texte de landing page');
  });

  test('it displays the sublabel', async function (assert) {
    // when
    const screen = await render(<template><LandingPageText @campaign={{data.campaign}} /></template>);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.landing-page-text.sublabel'), { exact: false }))
      .exists();
  });
});
