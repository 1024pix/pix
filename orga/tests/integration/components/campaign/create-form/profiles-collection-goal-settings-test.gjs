import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ProfilesCollectionGoalSettings from 'pix-orga/components/campaign/create-form/profiles-collection-goal-settings';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::ProfilesCollectionGoalSettings', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const prescriber = store.createRecord('prescriber', {
      firstName: 'Adam',
      lastName: 'Troisjour',
      id: '1',
    });
    data.campaign = store.createRecord('campaign', { ownerId: prescriber.id });
    data.membersSortedByFullName = [prescriber];
    data.errors = {};
  });

  test('it displays the campaign name, owner and external id fields without any course selection', async function (assert) {
    // when
    const screen = await render(
      <template>
        <ProfilesCollectionGoalSettings
          @campaign={{data.campaign}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.membersSortedByFullName}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-creation.name.label'), { exact: false })).exists();
    assert.dom(screen.getAllByText(t('pages.campaign-creation.owner.title'))[0]).exists();
    assert
      .dom(screen.getByRole('radiogroup', { name: t('pages.campaign-creation.external-id-label.question-label') }))
      .exists();
    assert
      .dom(screen.queryByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
      .doesNotExist();
  });

  test('it displays fields for enabling multiple sendings with the profiles wording', async function (assert) {
    // when
    const screen = await render(
      <template>
        <ProfilesCollectionGoalSettings
          @campaign={{data.campaign}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.membersSortedByFullName}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText(t('pages.campaign-creation.multiple-sendings.profiles.question-label'))).exists();
    assert.dom(screen.getByText(t('pages.campaign-creation.multiple-sendings.profiles.info'))).exists();
  });
});
