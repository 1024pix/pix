import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearner | Activity::ParticipationRow', function (hooks) {
  setupIntlRenderingTest(hooks);
  let router;

  hooks.beforeEach(function () {
    router = this.owner.lookup('service:router');
    router.transitionTo = sinon.stub();
  });

  test('it displays participation details', async function (assert) {
    // given
    this.participation = {
      id: '123',
      campaignType: 'ASSESSMENT',
      campaignName: 'Ma campagne',
      createdAt: new Date('2023-02-01'),
      sharedAt: new Date('2023-03-01'),
      status: 'SHARED',
    };

    // when
    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationRow @participation={{this.participation}} />`,
    );

    // then
    assert.dom(screen.getByRole('link', { name: this.participation.campaignName })).exists();
    assert
      .dom(
        screen.getByRole('cell', {
          name: this.intl.t('components.campaign.type.information.ASSESSMENT'),
        }),
      )
      .exists();
    assert.dom(screen.getByRole('cell', { name: '01/02/2023' })).exists();
    assert.dom(screen.getByRole('cell', { name: '01/03/2023' })).exists();
    assert
      .dom(screen.getByRole('cell', { name: this.intl.t('components.participation-status.SHARED-ASSESSMENT') }))
      .exists();
  });

  test('it displays the participation count', async function (assert) {
    // given
    this.participation = {
      id: '123',
      campaignType: 'ASSESSMENT',
      campaignName: 'Allez l OM',
      createdAt: new Date('2023-02-01'),
      sharedAt: new Date('2023-03-01'),
      status: 'SHARED',
      participationCount: 3,
    };

    // when
    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationRow @participation={{this.participation}} />`,
    );

    // then
    assert.dom(screen.getByRole('cell', { name: '3' })).exists();
  });

  test('it should transition to assessment detail when campaignType is ASSESSMENT', async function (assert) {
    // given
    this.participation = {
      id: '123',
      campaignId: '456',
      campaignType: 'ASSESSMENT',
      campaignName: 'Ma campagne',
      createdAt: new Date('2023-02-01'),
      sharedAt: new Date('2023-03-01'),
      status: 'SHARED',
      lastCampaignParticipationId: 345,
    };
    this.route = 'authenticated.campaigns.participant-assessment';

    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationRow @participation={{this.participation}} />`,
    );

    // when
    await click(await screen.findByRole('cell', { name: '01/02/2023' }));

    // then
    assert.ok(
      router.transitionTo.calledWith(
        this.route,
        this.participation.campaignId,
        this.participation.lastCampaignParticipationId,
      ),
    );
  });

  test('it should transition to profile collection detail when campaignType is PROFILE_COLLECTION', async function (assert) {
    // given
    this.participation = {
      id: '125',
      campaignId: '789',
      campaignType: 'PROFILES_COLLECTION',
      campaignName: 'Ma campagne',
      createdAt: new Date('2023-02-01'),
      sharedAt: new Date('2023-03-01'),
      status: 'SHARED',
      lastCampaignParticipationId: 345,
    };
    this.route = 'authenticated.campaigns.participant-profile';

    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationRow @participation={{this.participation}} />`,
    );

    // when
    await click(await screen.findByRole('cell', { name: '01/02/2023' }));

    // then
    assert.ok(
      router.transitionTo.calledWith(
        this.route,
        this.participation.campaignId,
        this.participation.lastCampaignParticipationId,
      ),
    );
  });
});
