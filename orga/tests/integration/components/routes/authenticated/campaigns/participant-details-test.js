import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign | participant-details', function(hooks) {
  setupRenderingTest(hooks);

  let store;
  let user, campaignParticipation, campaignId;
  hooks.beforeEach(function() {
    campaignId = 1;

    run(() => {
      store = this.owner.lookup('service:store');
    });
    user = run(() => store.createRecord('user', {
      firstName: 'Prénom',
      lastName: 'Nom',
    }));
    campaignParticipation  = run(() => store.createRecord('user', {
      createdAt: '2019-03-07T10:57:31.567Z',
      sharedAt: '2019-04-10T10:57:31.567Z',
      participantExternalId: 'mail@pro.net',
      user: user
    }));

    this.set('campaignParticipation', campaignParticipation);
    this.set('campaignId', campaignId);

  });

  test('it should display user details', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaigns/participant-details campaignId=campaignId campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.page__title').hasText('Prénom Nom');
  });


  test('it should display user details', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaigns/participant-details campaignId=campaignId campaignParticipation=campaignParticipation}}`);

    // then
    assert.dom('.page__title').hasText('Prénom Nom');
  });
});
