import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { t } from 'ember-intl/test-support';
import CourseSelection from 'pix-orga/components/campaign/create-form/course-selection';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::CourseSelection', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign');
    data.errors = {};
  });

  test('it does not display a course card nor an error when no course is selected', async function (assert) {
    // when
    const screen = await render(
      <template><CourseSelection @campaign={{data.campaign}} @errors={{data.errors}} @tab="targetProfile" /></template>,
    );

    // then
    assert.dom(screen.queryByRole('heading')).doesNotExist();
    assert.dom(screen.queryByText(t('api-error-messages.campaign-creation.target-profile-required'))).doesNotExist();
  });

  test('it displays informations about the selected course', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    data.campaign.course = store.createRecord('course', {
      id: '1',
      name: 'targetProfile1',
      type: 'targetProfile',
      nbTubes: 3,
      isSimplifiedAccess: true,
    });

    // when
    const screen = await render(
      <template><CourseSelection @campaign={{data.campaign}} @errors={{data.errors}} @tab="targetProfile" /></template>,
    );

    // then
    assert.dom(screen.getByText(t('pages.catalogue.card.tag.target-profile'))).exists();
    assert.dom(screen.getByRole('heading', { name: data.campaign.course.name })).exists();
    assert
      .dom(screen.getByText(t('pages.catalogue.card.tubes-count', { count: data.campaign.course.nbTubes })))
      .exists();
    assert.dom(screen.getByText(t('pages.catalogue.card.simplified-access'))).exists();
  });

  test('it redirects to the catalogue tab given as argument', async function (assert) {
    // when
    const screen = await render(
      <template><CourseSelection @campaign={{data.campaign}} @errors={{data.errors}} @tab="blueprint" /></template>,
    );

    // then
    assert
      .dom(screen.getByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
      .hasAttribute('href', '/catalogue/blueprint');
  });

  test('it displays an error message when the course is missing', async function (assert) {
    // given
    const campaignWithErrors = EmberObject.create({
      errors: {
        targetProfile: [{ message: 'TARGET_PROFILE_IS_REQUIRED' }],
      },
    });
    data.errors = campaignWithErrors.errors;

    // when
    const screen = await render(
      <template><CourseSelection @campaign={{data.campaign}} @errors={{data.errors}} @tab="targetProfile" /></template>,
    );

    // then
    assert.dom(screen.getByText(t('api-error-messages.campaign-creation.target-profile-required'))).exists();
  });
});
