import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module ('Integration | Component | routes/authenticated/campaign | details-item', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  test('it should display campaign details', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    });

    this.set('campaign', campaign);

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);

    // then
    assert.dom('.campaign-details-header__title').hasText('campagne 1');
  });

  module('Campaign details header', function() {
    test('it should display the campaign report', async function(assert) {
      // given
      const campaignReport = store.createRecord('campaignReport', {
        id: 1,
        participationsCount: 10,
        sharedParticipationsCount: 4,
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        campaignReport,
        code: '1234PixTest',
        type: 'ASSESSMENT',
      });

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
      // then
      assert.dom('.campaign-details-header-report__info:nth-child(1) .campaign-details-content__text').hasText('1234PixTest');
      assert.dom('.campaign-details-header-report__info:nth-child(2) .campaign-details-content__text').hasText('10');
      assert.dom('.campaign-details-header-report__shared .campaign-details-content__text').hasText('4');
    });

    test('it should display - instead of 0 for the campaign report', async function(assert) {
      // given
      const campaignReport = store.createRecord('campaignReport', {
        id: 1,
        participationsCount: 0,
        sharedParticipationsCount: 0,
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        campaignReport
      });

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);

      // then
      assert.dom('.campaign-details-header-report__info:nth-child(2) .campaign-details-content__text').hasText('-');
      assert.dom('.campaign-details-header-report__shared .campaign-details-content__text').hasText('-');
    });
  });

  module('Navigation', function() {

    hooks.beforeEach(function() {
      this.owner.setupRouter();
    });

    test('it should display campaign details item', async function(assert) {

      const campaign = store.createRecord('campaign', {
        id: 12
      });

      this.set('campaign', campaign);

      await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
      assert.dom('nav a[href="/campagnes/12"]').hasText('Détails');
    });

    module('When campaign type is ASSESSMENT', function() {
      test('it should display participation item', async function(assert) {
        const campaignReport = store.createRecord('campaignReport', {
          participationsCount: 10,
        });
        const campaign = store.createRecord('campaign', {
          id: 13,
          campaignReport,
          type: 'ASSESSMENT',
        });

        this.set('campaign', campaign);

        await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);

        assert.dom('nav a[href="/campagnes/13/participants"]').hasText('Participants (10)');
      });

      test('it should display collective results item', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          id: 14,
          type: 'ASSESSMENT',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
        // then
        assert.dom('nav a[href="/campagnes/14/resultats-collectifs"]').hasText('Résultats collectifs');
      });
    });

    module('When campaign type is PROFILES_COLLECTION', function() {
      test('it should not display participation item', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          id: 15,
          type: 'PROFILES_COLLECTION',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
        // then
        assert.dom('nav a[href="/campagnes/15/participants"]').doesNotExist();
      });

      test('it should not display collective results item', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          id: 16,
          type: 'PROFILES_COLLECTION',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
        // then
        assert.dom('nav a[href="/campagnes/16/resultats-collectifs"]').doesNotExist();
      });
    });
  });
});
