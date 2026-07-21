import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseGoalSettings from 'pix-orga/components/campaign/create-form/combined-course-goal-settings';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::CombinedCourseGoalSettings', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign');
    data.errors = {};
  });

  test('it redirects to /catalogue/blueprint for course selection', async function (assert) {
    // when
    const screen = await render(
      <template><CombinedCourseGoalSettings @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert
      .dom(screen.getByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
      .hasAttribute('href', '/catalogue/blueprint');
  });

  test('it does not display the campaign name field until a course is selected', async function (assert) {
    // when
    const screen = await render(
      <template><CombinedCourseGoalSettings @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert.dom(screen.queryByLabelText(t('pages.campaign-creation.name.label'), { exact: false })).doesNotExist();
  });

  test('it displays the campaign name field once a course is selected', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    data.campaign.course = store.createRecord('course', {
      id: '1',
      name: 'Mon schéma de parcours combiné',
      type: 'blueprint',
      nbModules: 3,
      isSimplifiedAccess: true,
    });

    // when
    const screen = await render(
      <template><CombinedCourseGoalSettings @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-creation.name.label'), { exact: false })).exists();
  });
});
