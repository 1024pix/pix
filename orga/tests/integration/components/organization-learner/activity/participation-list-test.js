import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearner::Activity::ParticipationList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participations details of Assessment', async function (assert) {
    this.set('participations', [
      {
        campaignType: 'ASSESSMENT',
        campaignName: 'Ma 1ère campagne',
        createdAt: '2022-12-12',
        sharedAt: '2022-12-25',
        status: 'SHARED',
        participationCount: '2',
      },
    ]);

    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationList @participations={{this.participations}} />`,
    );

    assert.ok(screen.getByText('Ma 1ère campagne'));
    assert.ok(screen.getByText('Évaluation'));
    assert.ok(screen.getByText('12/12/2022'));
    assert.ok(screen.getByText('25/12/2022'));
    assert.ok(screen.getByText(t('components.participation-status.SHARED')));
    assert.ok(screen.getByText('2'));
  });

  test('it should display participations details of Profiles collection', async function (assert) {
    this.set('participations', [
      {
        campaignType: 'PROFILES_COLLECTION',
        campaignName: 'Ma 1ère campagne',
        createdAt: '2022-12-12',
        sharedAt: '2022-12-25',
        status: 'SHARED',
        participationCount: '1',
      },
    ]);

    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationList @participations={{this.participations}} />`,
    );

    assert.ok(screen.getByText('Ma 1ère campagne'));
    assert.ok(screen.getByText('Collecte de profil'));
    assert.ok(screen.getByText('12/12/2022'));
    assert.ok(screen.getByText('25/12/2022'));
    assert.ok(screen.getByText(t('components.participation-status.SHARED')));
    assert.ok(screen.getByText('1'));
  });

  module('redirect to campaign user detail', function (hooks) {
    let router;

    hooks.beforeEach(function () {
      router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();
    });

    test('it should transition to profile collection detail when campaignType is PROFILE_COLLECTION', async function (assert) {
      const router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();
      // given
      this.set('participations', [
        {
          id: '125',
          campaignId: 789,
          campaignType: 'PROFILES_COLLECTION',
          campaignName: 'Ma campagne',
          createdAt: new Date('2023-02-01'),
          sharedAt: new Date('2023-03-01'),
          status: 'SHARED',
          lastCampaignParticipationId: 345,
        },
      ]);
      this.route = 'authenticated.campaigns.participant-profile';

      const screen = await render(
        hbs`<OrganizationLearner::Activity::ParticipationList @participations={{this.participations}} />`,
      );

      // when
      await click(await screen.findByRole('cell', { name: '01/02/2023' }));

      // then
      assert.ok(
        router.transitionTo.calledWith(
          this.route,
          this.participations[0].campaignId,
          this.participations[0].lastCampaignParticipationId,
        ),
      );
    });

    test('it should transition to assessment detail when campaignType is ASSESSMENT', async function (assert) {
      // given
      this.set('participations', [
        {
          id: '123',
          campaignId: '456',
          campaignType: 'ASSESSMENT',
          campaignName: 'Ma campagne',
          createdAt: new Date('2023-02-01'),
          sharedAt: new Date('2023-03-01'),
          status: 'SHARED',
          lastCampaignParticipationId: 345,
        },
      ]);
      this.route = 'authenticated.campaigns.participant-assessment';

      const screen = await render(
        hbs`<OrganizationLearner::Activity::ParticipationList @participations={{this.participations}} />`,
      );

      // when
      await click(await screen.findByRole('cell', { name: '01/02/2023' }));

      // then
      assert.ok(
        router.transitionTo.calledWith(
          this.route,
          this.participations[0].campaignId,
          this.participations[0].lastCampaignParticipationId,
        ),
      );
    });
  });
});
