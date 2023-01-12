import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearner::Activity', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#Empty state', function () {
    test('it should display the empty state when no participations', async function (assert) {
      // given
      const participations = [];
      const statistics = [
        {
          id: 'ASSESSMENT',
          shared: 0,
          started: 0,
          to_share: 0,
          total: 0,
        },
        {
          id: 'PROFILES_COLLECTION',
          shared: 0,
          started: 0,
          to_share: 0,
          total: 0,
        },
      ];

      this.set('participations', participations);
      this.set('statistics', statistics);
      this.set('learner', { lastName: 'dylan', firstName: 'bob' });

      // when
      const screen = await render(
        hbs`<OrganizationLearner::Activity @participations={{this.participations}} @statistics={{this.statistics}} @learner={{this.learner}}/>`
      );

      // then
      assert
        .dom(
          screen.queryByText(
            this.intl.t('pages.organization-learner.activity.empty-state', {
              organizationLearnerFirstName: 'Bob',
              organizationLearnerLastName: 'Dylan',
            })
          )
        )
        .exists();
    });

    test('it should not display the empty state when there is participations', async function (assert) {
      // given
      const participations = [
        {
          campaignType: 'ASSESSMENT',
          campaignName: 'Ma 1ère campagne',
          createdAt: '2022-12-12',
          sharedAt: '2022-12-25',
          status: 'SHARED',
        },
      ];
      const statistics = [
        {
          id: 'ASSESSMENT',
          shared: 1,
          started: 0,
          to_share: 0,
          total: 0,
        },
        {
          id: 'PROFILES_COLLECTION',
          shared: 0,
          started: 0,
          to_share: 0,
          total: 0,
        },
      ];
      this.set('participations', participations);
      this.set('statistics', statistics);
      this.set('learner', { lastName: 'Dylan', firstName: 'Bob' });

      // when
      const screen = await render(
        hbs`<OrganizationLearner::Activity @participations={{this.participations}} @statistics={{this.statistics}} @learner={{this.learner}}/>`
      );

      // then
      assert
        .dom(
          screen.queryByText(
            this.intl.t('pages.organization-learner.activity.empty-state', {
              organizationLearnerFirstName: 'Bob',
              organizationLearnerLastName: 'Dylan',
            })
          )
        )
        .doesNotExist();
    });
  });
});
