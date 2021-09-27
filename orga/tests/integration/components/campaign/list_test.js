import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::List', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('triggerFilteringSpy', () => {});
    this.set('goToCampaignPageSpy', () => {});
  });

  module('When there are no campaigns to display', function () {
    test('it should display an empty list message', async function (assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.contains('Aucune campagne');
    });
  });

  module('When there are campaigns to display', function () {
    test('it should display a list of campaigns', async function (assert) {
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
      await render(hbs`<Campaign::List
                  @campaigns={{this.campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.notContains('Aucune campagne');
      assert.dom('[aria-label="Campagne"]').exists({ count: 2 });
    });

    test('it should display a link to access campaign detail', async function (assert) {
      // given
      this.owner.setupRouter();

      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        code: 'AAAAAA111',
      });

      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{this.campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('a[href="/campagnes/1"]').exists();
    });

    test('it should display the name of the campaigns', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        code: 'AAAAAA111',
      });
      const campaign2 = store.createRecord('campaign', {
        id: 2,
        name: 'campagne 2',
        code: 'BBBBBB222',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{campaigns}}
                  @onFilter={{this.triggerFilteringSpy}}
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);
      // then
      assert.contains('campagne 1');
      assert.contains('campagne 2');
    });

    test('it should display the creator of the campaigns', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        creatorFirstName: 'Jean-Michel',
        creatorLastName: 'Jarre',
      });
      const campaign2 = store.createRecord('campaign', {
        creatorFirstName: 'Mathilde',
        creatorLastName: 'Bonnin de La Bonninière de Beaumont',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{campaigns}}
                  @onFilter={{this.triggerFilteringSpy}}
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[aria-label="Campagne"]:first-child').containsText('Jean-Michel Jarre');
      assert.dom('[aria-label="Campagne"]:last-child').containsText('Mathilde Bonnin de La Bonninière de Beaumont');
    });

    test('it must display the creation date of the campaigns', async function (assert) {
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
      await render(hbs`<Campaign::List
                  @campaigns={{campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.contains('02/02/2020');
    });

    test('it should display the participations count', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        participationsCount: 10,
      });

      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[aria-label="Campagne"]').containsText('10');
    });

    test('it should display the shared participations count', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        sharedParticipationsCount: 4,
      });

      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[aria-label="Campagne"]').containsText('4');
    });

    test('it should display the placeholder of the filter by campaign field', async function (assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{this.campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[placeholder="Rechercher une campagne"]').exists();
    });

    test('it should display the placeholder of the filter by creator field', async function (assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<Campaign::List
                  @campaigns={{this.campaigns}}
                  @onFilter={{this.triggerFilteringSpy}} 
                  @onClickCampaign={{this.goToCampaignPageSpy}} />`);

      // then
      assert.dom('[placeholder="Rechercher un créateur"]').exists();
    });
  });
});
