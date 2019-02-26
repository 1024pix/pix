import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign | details-item', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display campaign details', async function(assert) {
    // given
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-header__title').hasText('campagne 1');
  });

  test('it should display target profile related to campaign', async function(assert) {
    // given
    const targetProfile = run(() => store.createRecord('targetProfile', {
      id: 1,
      name: 'profil cible de la campagne 1',
    }));
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      targetProfile
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-content:first-child .campaign-details-content__text').hasText('profil cible de la campagne 1');
  });

  test('it should display the campaign report', async function(assert) {
    // given
    const campaignReport = run(() => store.createRecord('campaignReport', {
      id: 1,
      participationsCount: 10,
      sharedParticipationsCount: 4,
    }));
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      campaignReport
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-header-report__participants .campaign-details-content__text').hasText('10');
    assert.dom('.campaign-details-header-report__shared .campaign-details-content__text').hasText('4');
  });

  test('it should display - instead of 0 for the campaign report', async function(assert) {
    // given
    const campaignReport = run(() => store.createRecord('campaignReport', {
      id: 1,
      participationsCount: 0,
      sharedParticipationsCount: 0,
    }));
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      campaignReport
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-header-report__participants .campaign-details-content__text').hasText('-');
    assert.dom('.campaign-details-header-report__shared .campaign-details-content__text').hasText('-');
  });
});
