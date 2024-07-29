import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::List', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('noop', sinon.stub());
  });

  module('When there are no campaigns to display', function () {
    test('it should display an empty list message', async function (assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.dom(screen.getByText('Aucune campagne')).exists();
    });
  });

  module('Filter Banner', function () {
    test('should display filter banner', async function (assert) {
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.dom(screen.getByText('Filtres')).exists();
    });
  });

  module('When there are campaigns to display', function () {
    test('it should display a list of campaigns', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaign2 = store.createRecord('campaign', {
        id: '2',
        name: 'campagne 2',
        code: 'BBBBBB222',
        type: 'ASSESSMENT',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.notOk(screen.queryByLabelText('Aucune campagne'));
      assert.ok(screen.queryByText('campagne 1'));
      assert.ok(screen.queryByText('campagne 2'));
    });

    test('it should display a link to access campaign detail', async function (assert) {
      // given
      this.owner.setupRouter();

      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.dom('a[href="/campagnes/1"]').exists();
    });

    test('it should display the name of the campaigns', async function (assert) {
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaign2 = store.createRecord('campaign', {
        id: '2',
        name: 'campagne 2',
        code: 'BBBBBB222',
        type: 'ASSESSMENT',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.dom(screen.getByText('campagne 1')).exists();
      assert.dom(screen.getByText('campagne 2')).exists();
    });

    test('it should display the code of the campaigns', async function (assert) {
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaign2 = store.createRecord('campaign', {
        id: '2',
        name: 'campagne 2',
        code: 'BBBBBB222',
        type: 'ASSESSMENT',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.dom(screen.getByText('AAAAAA111')).exists();
      assert.dom(screen.getByText('BBBBBB222')).exists();
    });

    test('should hide campaign owner', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
        ownerFirstName: 'Michel',
        ownerLastName: 'Dupont',
      });
      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.strictEqual(screen.queryByText(t('pages.campaigns-list.table.column.created-by')), null);
      assert.strictEqual(screen.queryByText('Michel Dupont'), null);
    });

    test('it should display the owner of the campaigns', async function (assert) {
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
        ownerFirstName: 'Jean-Michel',
        ownerLastName: 'Jarre',
      });
      const campaign2 = store.createRecord('campaign', {
        id: '2',
        name: 'campagne 2',
        code: 'BBBBBB222',
        type: 'ASSESSMENT',
        ownerFirstName: 'Mathilde',
        ownerLastName: 'Bonnin de La Bonninière de Beaumont',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @showCampaignOwner={{true}}
/>`,
      );

      // then
      assert.ok(screen.getByText('Jean-Michel Jarre'));
      assert.ok(screen.getByText('Mathilde Bonnin de La Bonninière de Beaumont'));
    });

    test('it must display the creation date of the campaigns', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        type: 'ASSESSMENT',
        code: 'AAAAAA111',
        createdAt: '03/02/2020',
      });
      const campaign2 = store.createRecord('campaign', {
        id: '2',
        name: 'campagne 2',
        type: 'ASSESSMENT',
        code: 'BBBBBB222',
        createdAt: '02/02/2020',
      });
      const campaigns = [campaign2, campaign1];
      campaigns.meta = {
        rowCount: 2,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.dom(screen.getByText('02/02/2020')).exists();
    });

    test('it should display the participations count', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        participationsCount: 10,
        type: 'ASSESSMENT',
      });

      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.ok(screen.getByRole('cell', { name: '10' }));
    });

    test('it should display the shared participations count', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        sharedParticipationsCount: 4,
        type: 'ASSESSMENT',
      });

      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then
      assert.ok(screen.getByText('4'));
    });

    module('when showing current user campaign list', function () {
      test('it should not show created by column and value', async function (assert) {
        // given
        const campaigns = [
          { name: 'campagne 1', code: 'AAAAAA111', type: 'ASSESSMENT', ownerFullName: 'Dupont Alice' },
          { name: 'campagne 2', code: 'BBBBBB222', type: 'ASSESSMENT', ownerFullName: 'Dupont Alice' },
        ];
        campaigns.meta = {
          rowCount: 2,
        };
        this.set('campaigns', campaigns);
        this.set('canDelete', true);

        // when
        const screen = await render(
          hbs`<Campaign::List
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{this.canDelete}}
/>`,
        );

        // then
        assert.dom(screen.queryByLabelText(t('pages.campaigns-list.table.column.created-by'))).doesNotExist();
        assert.dom(screen.queryByLabelText('Dupont Alice')).doesNotExist();
      });
    });
  });

  test('it should display the caption', async function (assert) {
    // given
    const campaigns = [];
    campaigns.meta = { rowCount: 0 };
    this.set('campaigns', campaigns);

    // when
    const screen = await render(
      hbs`<Campaign::List
  @caption='Something'
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{true}}
/>`,
    );

    // then
    assert.dom(screen.getByText('Something')).exists();
  });

  module('When there are campaigns not only owned by current user', function () {
    test('should display checkboxes', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };
      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{true}}
/>`,
      );

      // then

      assert.strictEqual(screen.queryAllByRole('checkbox').length, 2);
    });

    test('should not display checkboxes', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaigns = [campaign1];
      campaigns.meta = {
        rowCount: 1,
      };

      this.set('campaigns', campaigns);

      // when
      const screen = await render(
        hbs`<Campaign::List @campaigns={{this.campaigns}} @onFilter={{this.noop}} @onClickCampaign={{this.noop}} />`,
      );

      // then

      assert.dom(screen.queryByRole('checkbox')).doesNotExist();
    });
  });

  module('When there are only campaigns owned by current user', function (hooks) {
    hooks.beforeEach(function () {
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');
      const store = this.owner.lookup('service:store');

      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaign2 = store.createRecord('campaign', {
        id: '2',
        name: 'campagne 2',
        code: 'BBBBBB222',
        type: 'ASSESSMENT',
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };
      this.set('campaigns', campaigns);
    });
    test('should display checkboxes', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::List
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{true}}
/>`,
      );

      // then
      assert.strictEqual(screen.queryAllByRole('checkbox').length, 3);
    });

    test('should reset selected campaigns when using pagination', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::List
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{true}}
/>`,
      );

      const firstCampaignCheckbox = screen.getAllByRole('checkbox')[1];
      await click(firstCampaignCheckbox);

      const nextButton = await screen.findByLabelText(t('common.pagination.action.next'));
      await click(nextButton);

      // then
      assert.false(firstCampaignCheckbox.checked);
    });

    test('should reset selected campaigns when using filters', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::List
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{true}}
/>`,
      );

      const firstCampaignCheckbox = screen.getAllByRole('checkbox')[1];
      await click(firstCampaignCheckbox);

      await fillByLabel(t('pages.campaigns-list.filter.by-name'), '1');

      // then
      assert.false(firstCampaignCheckbox.checked);
    });

    test('should reset selected campaigns when resetting filters', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::List
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{true}}
  @nameFilter='1'
  @onClear={{this.noop}}
/>`,
      );

      const firstCampaignCheckbox = screen.getAllByRole('checkbox')[1];
      await click(firstCampaignCheckbox);

      const resetButton = await screen.findByRole('button', {
        name: t('common.filters.actions.clear'),
      });
      await click(resetButton);

      // then
      assert.false(firstCampaignCheckbox.checked);
    });

    test('should delete campaigns', async function (assert) {
      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'adapterFor');
      const deleteStub = sinon.stub();
      store.adapterFor.callsFake(() => ({ delete: deleteStub }));
      // when
      const onDeleteCampaignsStub = sinon.stub();
      this.set('onDeleteCampaigns', onDeleteCampaignsStub);

      const screen = await render(
        hbs`<Campaign::List
  @organizationId='1'
  @campaigns={{this.campaigns}}
  @onFilter={{this.noop}}
  @onClickCampaign={{this.noop}}
  @canDelete={{true}}
  @onDeleteCampaigns={{this.onDeleteCampaigns}}
/>`,
      );

      await click(screen.getAllByRole('checkbox')[1]);
      await click(screen.getAllByRole('checkbox')[2]);

      const deleteButton = await screen.findByRole('button', {
        name: t('pages.campaigns-list.action-bar.delete-button'),
      });
      await click(deleteButton);

      await screen.findByRole('dialog');

      const allowMultipleDeletionCheckbox = await screen.findByRole('checkbox', {
        name: t('components.ui.deletion-modal.confirmation-checkbox', { count: 2 }),
      });
      await click(allowMultipleDeletionCheckbox);

      const confirmationButton = await screen.findByRole('button', {
        name: t('components.ui.deletion-modal.confirm-deletion'),
      });
      await click(confirmationButton);

      //then
      assert.ok(onDeleteCampaignsStub.called);
      assert.ok(deleteStub.calledWith('1', ['1', '2']));
      const mainCheckbox = screen.getAllByRole('checkbox')[0];
      assert.false(mainCheckbox.checked);
    });
  });
});
