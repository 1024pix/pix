import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign | list-items', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of campaigns', async function(assert) {
    // given
    const campaigns = [
      { name: 'campagne 1', code: 'AAAAAA111'},
      { name: 'campagne 2', code: 'BBBBBB222'},
    ];

    this.set('campaigns', campaigns);

    // when
    await render(hbs`{{routes/authenticated/campaigns/list-items campaigns=campaigns}}`);

    // then
    assert.dom('.campaign-list').exists();
    assert.dom('.campaign-list__item').exists({ count: 2 });
  });

  test('it should display the name of the campaigns', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
    let campaign1 = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      code: 'AAAAAA111'
    }));
    let campaign2 = run(() => store.createRecord('campaign', {
      id: 2,
      name: 'campagne 1',
      code: 'BBBBBB222'
    }));
    const campaigns = [campaign1, campaign2];

    this.set('campaigns', campaigns);

    // when
    await render(hbs`{{routes/authenticated/campaigns/list-items campaigns=campaigns}}`);

    // then
    assert.dom('.campaign-list__item:first-child .campaign-name').hasText('campagne 1');
  });

  test('it should display the participations count', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
    const campaignReport = run(() => store.createRecord('campaignReport', {
      id: 1,
      participationsCount: 10,
      sharedParticipationsCount: 4,
    }));

    let campaign1 = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      code: 'AAAAAA111',
      campaignReport
    }));

    const campaigns = [campaign1];

    this.set('campaigns', campaigns);

    // when
    await render(hbs`{{routes/authenticated/campaigns/list-items campaigns=campaigns}}`);

    // then
    assert.dom('.participations-counts__total .count-value').hasText('10');
  });

  test('it should display the shared participations count', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
    const campaignReport = run(() => store.createRecord('campaignReport', {
      id: 1,
      participationsCount: 10,
      sharedParticipationsCount: 4,
    }));

    let campaign1 = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      code: 'AAAAAA111',
      campaignReport
    }));

    const campaigns = [campaign1];

    this.set('campaigns', campaigns);

    // when
    await render(hbs`{{routes/authenticated/campaigns/list-items campaigns=campaigns}}`);

    // then
    assert.dom('.participations-counts__shared .count-value').hasText('4');
  });
});
