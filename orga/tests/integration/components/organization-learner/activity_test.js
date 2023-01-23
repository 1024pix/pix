import { module, test } from 'qunit';
import { render, within } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearner::Activity', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#Empty state', function () {
    test('it should display the empty state when no participations', async function (assert) {
      // given
      const participations = [];
      const statistics = [];

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
      const statistics = [];
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
    test('it should display assessement participations statistics when there is participations', async function (assert) {
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
          started: 2,
          to_share: 3,
          total: 6,
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
      const assessmentCard = within(
        screen.getByRole('heading', {
          name: this.intl.t('pages.organization-learner.activity.assessment-summary'),
        }).parentElement
      );
      assert.dom(assessmentCard.getByRole('definition')).containsText('6');
      assert
        .dom(assessmentCard.getByText(this.intl.t('pages.organization-learner.activity.cards.started', { count: 2 })))
        .exists();
      assert
        .dom(assessmentCard.getByText(this.intl.t('pages.organization-learner.activity.cards.to-share', { count: 3 })))
        .exists();
      assert
        .dom(assessmentCard.getByText(this.intl.t('pages.organization-learner.activity.cards.shared', { count: 1 })))
        .exists();
    });
    test('it should display profile collection participations statistics when there is participations', async function (assert) {
      // given
      const participations = [
        {
          campaignType: 'PROFILES_COLLECTION',
          campaignName: 'Ma 1ère campagne',
          createdAt: '2022-12-12',
          sharedAt: '2022-12-25',
          status: 'SHARED',
        },
      ];
      const statistics = [
        {
          id: 'PROFILES_COLLECTION',
          to_share: 3,
          shared: 1,
          total: 4,
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
      const profileCollectionCard = within(
        screen.getByRole('heading', {
          name: this.intl.t('pages.organization-learner.activity.profile-collection-summary'),
        }).parentElement
      );
      assert.dom(profileCollectionCard.getByRole('definition')).containsText('4');
      assert
        .dom(
          profileCollectionCard.getByText(
            this.intl.t('pages.organization-learner.activity.cards.to-share', { count: 3 })
          )
        )
        .exists();
      assert
        .dom(
          profileCollectionCard.getByText(this.intl.t('pages.organization-learner.activity.cards.shared', { count: 1 }))
        )
        .exists();
    });
  });
});
