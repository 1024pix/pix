import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import List from 'pix-orga/components/campaign/list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::List', function (hooks) {
  setupIntlRenderingTest(hooks);

  const noop = sinon.stub();

  module('When there are no campaigns to display', function () {
    test('it should display an empty list message', async function (assert) {
      // given
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Aucune campagne')).exists();
    });
  });

  module('Filter Banner', function () {
    test('should display filter banner', async function (assert) {
      const campaigns = [];
      campaigns.meta = { rowCount: 0 };

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Filtres')).exists();
    });
  });

  module('When there are campaigns to display', function () {
    module('@showCampaignOwnerFilter', function (hooks) {
      const campaigns = [];

      hooks.beforeEach(function () {
        const store = this.owner.lookup('service:store');
        const campaign = store.createRecord('campaign', {
          id: '1',
          name: 'campagne 1',
          code: 'AAAAAA111',
          type: 'PROFILES_COLLECTION',
        });
        campaigns.push(campaign);
        campaigns.meta = { rowCount: campaigns.length };
      });

      test('it should show the owner filter ', async function (assert) {
        // when
        const screen = await render(
          <template>
            <List
              @campaigns={{campaigns}}
              @onFilter={{noop}}
              @onClickCampaign={{noop}}
              @hideCampaignOwnerFilter={{false}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByLabelText(t('pages.campaigns-list.filter.by-owner')));
      });
      test('it should hide the owner filter ', async function (assert) {
        // when
        const screen = await render(
          <template>
            <List
              @campaigns={{campaigns}}
              @onFilter={{noop}}
              @onClickCampaign={{noop}}
              @hideCampaignOwnerFilter={{true}}
            />
          </template>,
        );

        // then
        assert.notOk(screen.queryByLabelText(t('pages.campaigns-list.filter.by-owner')));
      });
    });

    test('it should show the owner filter ', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign1 = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        code: 'AAAAAA111',
        type: 'PROFILES_COLLECTION',
      });
      const campaigns = [campaign1];
      campaigns.meta = { rowCount: 1 };

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
      );

      // then
      assert.dom(screen.getByLabelText(t('pages.campaigns-list.filter.by-owner'))).exists();
    });

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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
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

      // when
      await render(<template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>);

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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
      );

      // then
      assert.ok(screen.getByText('AAAAAA111'));
      assert.ok(screen.getByText('BBBBBB222'));
    });

    test('it should not display the code when campaign is from combined course', async function (assert) {
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
        isFromCombinedCourse: true,
      });
      const campaigns = [campaign1, campaign2];
      campaigns.meta = {
        rowCount: 2,
      };

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
      );

      // then
      assert.ok(screen.getByText('AAAAAA111'));
      assert.notOk(screen.queryByText('BBBBBB222'));
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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
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

      // when
      const screen = await render(
        <template>
          <List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} @showCampaignOwner={{true}} />
        </template>,
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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
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
        const canDelete = true;

        // when
        const screen = await render(
          <template>
            <List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} @canDelete={{canDelete}} />
          </template>,
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

    // when
    const screen = await render(
      <template>
        <List
          @caption="Something"
          @campaigns={{campaigns}}
          @onFilter={{noop}}
          @onClickCampaign={{noop}}
          @canDelete={{true}}
        />
      </template>,
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

      // when
      const screen = await render(
        <template>
          <List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} @canDelete={{true}} />
        </template>,
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

      // when
      const screen = await render(
        <template><List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} /></template>,
      );

      // then
      assert.dom(screen.queryByRole('checkbox')).doesNotExist();
    });
  });

  module('When there are only campaigns owned by current user', function (hooks) {
    const campaigns = [];

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
      campaigns.push(campaign1, campaign2);
      campaigns.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };
    });
    test('should display checkboxes', async function (assert) {
      // when
      const screen = await render(
        <template>
          <List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} @canDelete={{true}} />
        </template>,
      );

      // then
      assert.strictEqual(screen.queryAllByRole('checkbox').length, 3);
    });

    test('should reset selected campaigns when using pagination', async function (assert) {
      // when
      const screen = await render(
        <template>
          <List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} @canDelete={{true}} />
        </template>,
      );

      const firstCampaignCheckbox = screen.getAllByRole('checkbox')[1];
      await click(firstCampaignCheckbox);

      const nextButton = await screen.findByRole('button', { name: 'Aller à la page suivante', exact: false });
      await click(nextButton);

      // then
      assert.false(firstCampaignCheckbox.checked);
    });

    test('should reset selected campaigns when using filters', async function (assert) {
      // when
      const screen = await render(
        <template>
          <List @campaigns={{campaigns}} @onFilter={{noop}} @onClickCampaign={{noop}} @canDelete={{true}} />
        </template>,
      );

      const firstCampaignCheckbox = screen.getAllByRole('checkbox')[1];
      await click(firstCampaignCheckbox);

      await fillByLabel(t('pages.campaigns-list.filter.by-name'), '1');

      // then
      assert.false(firstCampaignCheckbox.checked);
    });

    test('should reset selected campaigns when resetting filters', async function (assert) {
      const nameFilter = '1';
      // when
      const screen = await render(
        <template>
          <List
            @campaigns={{campaigns}}
            @onFilter={{noop}}
            @onClickCampaign={{noop}}
            @canDelete={{true}}
            @nameFilter={{nameFilter}}
            @onClear={{noop}}
          />
        </template>,
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

      const screen = await render(
        <template>
          <List
            @organizationId="1"
            @campaigns={{campaigns}}
            @onFilter={{noop}}
            @onClickCampaign={{noop}}
            @canDelete={{true}}
            @onDeleteCampaigns={{onDeleteCampaignsStub}}
          />
        </template>,
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
