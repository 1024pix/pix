import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | organization-campaigns-section', function(hooks) {
  setupRenderingTest(hooks);

  module('when there is no campaigns', function() {
    test('it should display aucune campagne', async function(assert) {
      this.set('campaigns', []);

      // when
      await render(hbs`<OrganizationCampaignsSection @campaigns={{ campaigns }}/>`);
      // then
      assert.contains('Aucune campagne');
    });
  });

  module('when there are campaigns', function() {
    test('it should display a list of campaigns', async function(assert) {
      const campaign1 = {
        id: 1,
        name: 'C1',
        archivedAt: new Date('2021-01-01'),
        type: 'ASSESSMENT',
        code: '123',
        createdAt: new Date('2021-01-02'),
        creatorLastName: 'King',
        creatorFirstName: 'Karam',
      };
      const campaign2 = {
        id: 2,
        name: 'C2',
        archivedAt: new Date('2021-01-03'),
        type: 'PROFILE_COLLECTION',
        code: '456',
        createdAt: new Date('2021-01-04'),
        creatorLastName: 'JJ',
        creatorFirstName: 'AA',
      };
      const campaigns = [campaign1, campaign2];
      campaigns.meta = { rowCount: 2 };
      this.set('campaigns', campaigns);
      // when
      await render(hbs`<OrganizationCampaignsSection @campaigns={{ campaigns }}/>`);

      // then
      assert.dom('[aria-label="campagne"]').exists({ count: 2 });
    });

    test('it should display information of each campaigns', async function(assert) {
      const campaign1 = {
        id: 1,
        name: 'C1',
        archivedAt: new Date('2021-01-01'),
        type: 'ASSESSMENT',
        code: '123',
        createdAt: new Date('2021-01-02'),
        creatorLastName: 'King',
        creatorFirstName: 'Karam',
      };
      const campaign2 = {
        id: 2,
        name: 'C2',
        archivedAt: new Date('2021-01-03'),
        type: 'PROFILE_COLLECTION',
        code: '456',
        createdAt: new Date('2021-01-04'),
        creatorLastName: 'JJ',
        creatorFirstName: 'AA',
      };
      const campaigns = [campaign1, campaign2];
      campaigns.meta = { rowCount: 2 };
      this.set('campaigns', campaigns);
      // when
      await render(hbs`<OrganizationCampaignsSection @campaigns={{ campaigns }}/>`);
      // then
      assert.contains('C1');
      assert.contains('Évaluation');
      assert.contains('123');
      assert.contains('Karam King');
      assert.contains('01/01/2021');
      assert.contains('02/01/2021');
      assert.contains('C2');
      assert.contains('Collecte de profils');
      assert.contains('123');
      assert.contains('Karam King');
      assert.contains('01/01/2021');
      assert.contains('02/01/2021');
    });

    test('it should display - when there is no archivedAt date', async function(assert) {
      const campaign = {
        id: 1,
        name: 'C1',
        archivedAt: null,
        type: 'ASSESSMENT',
        code: '123',
        createdAt: new Date('2021-01-02'),
        creatorLastName: 'King',
        creatorFirstName: 'Karam',
      };
      const campaigns = [campaign];
      campaigns.meta = { rowCount: 1 };
      this.set('campaigns', campaigns);

      // when
      await render(hbs`<OrganizationCampaignsSection @campaigns={{ campaigns }}/>`);
      // then
      assert.contains('-');
    });
  });
});
