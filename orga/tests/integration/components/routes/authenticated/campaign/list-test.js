import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('goToCampaignPageSpy', () => {});
    this.set('triggerFilteringSpy', () => {});
  });

  module('When there are no campaigns to display', function() {
    test('it should display an empty list message', async function(assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.contains('Aucune campagne');
    });
  });

  module('When there are campaigns to display', function() {
    test('it should display a list of campaigns', async function(assert) {
      // given
      const campaigns = [
        { name: 'campagne 1', code: 'AAAAAA111' },
        { name: 'campagne 2', code: 'BBBBBB222' },
      ];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{this.campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.notContains('Aucune campagne');
      assert.dom('[aria-label="Campagne"]').exists({ count: 2 });
    });

    test('it should display the name of the campaigns', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        code: 'AAAAAA111',
      });
      const campaign2 = store.createRecord('campaign', {
        id: 2,
        name: 'campagne 1',
        code: 'BBBBBB222',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.contains('campagne 1');
    });

    test('it should display the creator of the campaigns', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const user1 = store.createRecord('user', {
        id: 1,
        firstName: 'Jean-Michel',
        lastName: 'Jarre',
      });
      const user2 = store.createRecord('user', {
        id: 2,
        firstName: 'Mathilde',
        lastName: 'Bonnin de La Bonninière de Beaumont',
      });
      const campaign1 = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        creator: user1,
        code: 'AAAAAA111',
      });
      const campaign2 = store.createRecord('campaign', {
        id: 2,
        name: 'campagne 1',
        creator: user2,
        code: 'BBBBBB222',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[aria-label="Campagne"]:first-child').containsText('Jean-Michel Jarre');
      assert.dom('[aria-label="Campagne"]:last-child').containsText('Mathilde Bonnin de La Bonninière de Beaumont');
    });

    test('it must display the creation date of the campaigns', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        code: 'AAAAAA111',
        createdAt: '03/02/2020',
      });
      const campaign2 = store.createRecord('campaign', {
        id: 2,
        name: 'campagne 2',
        code: 'BBBBBB222',
        createdAt: '02/02/2020',
      });
      const campaigns = [campaign2, campaign1];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.contains('02/02/2020');
    });

    test('it should display the participations count', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaignReport = store.createRecord('campaignReport', {
        id: 1,
        participationsCount: 10,
        sharedParticipationsCount: 4,
      });

      const campaign1 = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        code: 'AAAAAA111',
        campaignReport,
      });

      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[aria-label="Campagne"]').containsText('10');
    });

    test('it should display the shared participations count', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaignReport = store.createRecord('campaignReport', {
        id: 1,
        participationsCount: 10,
        sharedParticipationsCount: 4,
      });

      const campaign1 = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        code: 'AAAAAA111',
        campaignReport,
      });

      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[aria-label="Campagne"]').containsText('4');
    });

    test('it should display the placeholder of the filter by campaign field', async function(assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{this.campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[placeholder="Rechercher une campagne"]').exists();
    });

    test('it should display the placeholder of the filter by creator field', async function(assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::List
                  @campaigns={{this.campaigns}}
                  @triggerFiltering={{this.triggerFilteringSpy}}
                  @goToCampaignPage={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[placeholder="Rechercher un créateur"]').exists();
    });
  });
});
