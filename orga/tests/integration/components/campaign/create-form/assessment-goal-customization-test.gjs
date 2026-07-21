import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import AssessmentGoalCustomization from 'pix-orga/components/campaign/create-form/assessment-goal-customization';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::AssessmentGoalCustomization', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign', { type: 'ASSESSMENT' });
  });

  test('it displays fields for campaign title and landing page with matching sublabels', async function (assert) {
    // when
    const screen = await render(<template><AssessmentGoalCustomization @campaign={{data.campaign}} /></template>);

    // then
    assert.dom(screen.getByText(t('pages.campaign-creation.course-title.label'))).exists();
    const sublabels = screen.getAllByLabelText(t('pages.campaign-creation.landing-page-text.sublabel'), {
      exact: false,
    });
    assert.strictEqual(sublabels.length, 2);
  });

  test('it fills campaign title', async function (assert) {
    // given
    data.campaign.title = 'Mon titre de parcours';

    // when
    const screen = await render(<template><AssessmentGoalCustomization @campaign={{data.campaign}} /></template>);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.course-title.label'), { exact: false }))
      .hasValue('Mon titre de parcours');
  });

  test('it fills campaign landing page text', async function (assert) {
    // given
    data.campaign.customLandingPageText = 'Mon texte de landing page';

    // when
    const screen = await render(<template><AssessmentGoalCustomization @campaign={{data.campaign}} /></template>);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.landing-page-text.label'), { exact: false }))
      .hasValue('Mon texte de landing page');
  });
});
