import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ProfilesCollectionGoalCustomization from 'pix-orga/components/campaign/create-form/profiles-collection-goal-customization';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::ProfilesCollectionGoalCustomization', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign');
  });

  test('it displays the landing page field without any course selection', async function (assert) {
    // when
    const screen = await render(
      <template><ProfilesCollectionGoalCustomization @campaign={{data.campaign}} /></template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-creation.landing-page-text.label'), { exact: false })).exists();
  });

  test('it never displays the campaign title field', async function (assert) {
    // when
    const screen = await render(
      <template><ProfilesCollectionGoalCustomization @campaign={{data.campaign}} /></template>,
    );

    // then
    assert
      .dom(screen.queryByLabelText(t('pages.campaign-creation.course-title.label'), { exact: false }))
      .doesNotExist();
  });
});
