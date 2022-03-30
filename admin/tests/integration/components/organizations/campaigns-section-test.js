import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | organizations/campaigns-section', function (hooks) {
  setupRenderingTest(hooks);

  module('when there is no campaigns', function () {
    test('it should display aucune campagne', async function (assert) {
      // given
      this.set('campaigns', []);

      // when
      const screen = await render(hbs`<Organizations::CampaignsSection @campaigns={{ campaigns }}/>`);

      // then
      assert.dom(screen.getByText('Aucune campagne')).exists();
    });
  });

  module('when there are campaigns', function () {
    test('it should display campaign columns', async function (assert) {
      // given
      const campaign = {
        id: 1,
        name: 'C1',
        archivedAt: new Date('2021-01-01'),
        type: 'ASSESSMENT',
        code: '123',
        createdAt: new Date('2021-01-02'),
        creatorLastName: 'K',
        creatorFirstName: 'K',
      };
      const campaigns = [campaign];
      campaigns.meta = { rowCount: 1 };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(hbs`<Organizations::CampaignsSection @campaigns={{ campaigns }}/>`);

      // then
      assert.dom(screen.getByText('ID')).exists();
      assert.dom(screen.getByText('Code')).exists();
      assert.dom(screen.getByText('Nom')).exists();
      assert.dom(screen.getByText('Type')).exists();
      assert.dom(screen.getByText('Créée le')).exists();
      assert.dom(screen.getByText('Créée par')).exists();
      assert.dom(screen.getByText('Propriétaire')).exists();
      assert.dom(screen.getByText('Archivée le')).exists();
    });

    test('it should display a list of campaigns', async function (assert) {
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
      const screen = await render(hbs`<Organizations::CampaignsSection @campaigns={{ campaigns }}/>`);

      // then
      assert.strictEqual(screen.getAllByLabelText('campagne').length, 2);
    });

    test('it should display information of each campaigns', async function (assert) {
      const campaign1 = {
        id: 1,
        name: 'C1',
        archivedAt: new Date('2021-01-01'),
        type: 'ASSESSMENT',
        code: '123',
        createdAt: new Date('2021-01-02'),
        creatorLastName: 'King',
        creatorFirstName: 'Karam',
        ownerLastName: 'Di',
        ownerFirstName: 'Amar',
      };
      const campaign2 = {
        id: 2,
        name: 'C2',
        archivedAt: new Date('2021-01-03'),
        type: 'PROFILE_COLLECTION',
        code: '456',
        createdAt: new Date('2021-01-04'),
        creatorLastName: 'Elizabeth',
        creatorFirstName: 'Queen',
        ownerLastName: 'Credi',
        ownerFirstName: 'Amer',
      };
      const campaigns = [campaign1, campaign2];
      campaigns.meta = { rowCount: 2 };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(hbs`<Organizations::CampaignsSection @campaigns={{ campaigns }}/>`);

      // then
      assert.dom(screen.getByText('C1')).exists();
      assert.dom(screen.getByText('Évaluation')).exists();
      assert.dom(screen.getByText('123')).exists();
      assert.dom(screen.getByText('Karam King')).exists();
      assert.dom(screen.getByText('Amar Di')).exists();
      assert.dom(screen.getByText('01/01/2021')).exists();
      assert.dom(screen.getByText('02/01/2021')).exists();

      assert.dom(screen.getByText('C2')).exists();
      assert.dom(screen.getByText('Collecte de profils')).exists();
      assert.dom(screen.getByText('456')).exists();
      assert.dom(screen.getByText('Queen Elizabeth')).exists();
      assert.dom(screen.getByText('Amer Credi')).exists();
      assert.dom(screen.getByText('03/01/2021')).exists();
      assert.dom(screen.getByText('04/01/2021')).exists();
    });

    test('it should display - when there is no archivedAt date', async function (assert) {
      // given
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
      const screen = await render(hbs`<Organizations::CampaignsSection @campaigns={{ campaigns }}/>`);

      // then
      assert.dom(screen.getByText('-')).exists();
    });
  });
});
