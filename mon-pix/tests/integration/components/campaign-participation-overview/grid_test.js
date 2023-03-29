import { module, test } from 'qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignParticipationOverview | Grid', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('should render component', async function (assert) {
    // when
    await render(hbs`<CampaignParticipationOverview::Grid />}`);

    // then
    assert.dom('.campaign-participation-overview-grid').exists();
  });

  test('should render campaign participation overview items', async function (assert) {
    // given
    const campaignParticipationOverviews = [
      store.createRecord('campaign-participation-overview', {
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign 1',
      }),
      store.createRecord('campaign-participation-overview', {
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign 2',
      }),
    ];
    this.set('campaignParticipationOverviews', campaignParticipationOverviews);

    // when
    await render(hbs`<CampaignParticipationOverview::Grid @model={{this.campaignParticipationOverviews}} />}`);

    // then
    assert.strictEqual(findAll('.campaign-participation-overview-grid__item').length, 2);

    const participationCardSubtitles = findAll('.campaign-participation-overview-card-header__subtitle');

    assert.strictEqual(participationCardSubtitles[0].textContent, 'My campaign 1');
    assert.strictEqual(participationCardSubtitles[1].textContent, 'My campaign 2');
  });
});
