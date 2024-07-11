import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Filter::ParticipationFilters', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;
  const campaignId = '1';

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.set('noop', () => {});
  });

  module('Basic Filter State', function () {
    test('it should display one filtered participant', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        type: 'ASSESSMENT',
      });
      const rowCount = 1;
      this.set('campaign', campaign);
      this.set('rowCount', rowCount);

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @rowCount={{this.rowCount}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
/>`,
      );

      // then
      assert.ok(screen.getByText('1 participant'));
    });

    test('it should display many filtered participants', async function (assert) {
      // given
      const badge = store.createRecord('badge');
      const campaign = store.createRecord('campaign', {
        type: 'ASSESSMENT',
        targetProfileHasStage: true,
        badges: [badge],
      });
      const rowCount = 2;

      this.set('campaign', campaign);
      this.set('details', rowCount);

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @rowCount={{this.details}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
/>`,
      );

      // then
      assert.ok(screen.getByText('2 participants'));
    });

    module('Filter button', function () {
      test('it triggers the reset filters button when user has clicked', async function (assert) {
        //given
        const badge = store.createRecord('badge');
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileHasStage: true,
          badges: [badge],
        });
        const resetFiltering = sinon.stub();
        this.set('campaign', campaign);
        this.set('resetFiltering', resetFiltering);
        this.set('searchFilter', 'toto');

        //when
        await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onResetFilter={{this.resetFiltering}}
  @searchFilter={{this.searchFilter}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
/>`,
        );

        await clickByName('Effacer les filtres');

        //then
        assert.ok(resetFiltering.called);
      });

      module('Campaign type ASSESSMENT', function () {
        test('it display disabled button', async function (assert) {
          //given
          const badge = store.createRecord('badge');
          const stage = store.createRecord('stage');

          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileHasStage: true,
            targetProfileThematicResultCount: 2,
            badges: [badge],
            stages: [stage],
          });
          this.set('campaign', campaign);
          this.set('resetFiltering', () => {});
          this.set('searchFilter', null);
          this.set('searchBadges', []);
          this.set('searchStages', []);
          this.set('selectedStages', []);
          this.set('selectedBadges', []);

          //when
          const screen = await render(
            hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onResetFilter={{this.resetFiltering}}
  @searchFilter={{this.searchFilter}}
  @searchBadges={{this.searchBadges}}
  @searchStages={{this.searchStages}}
  @selectedStages={{this.selectedStages}}
  @selectedBadges={{this.selectedBadges}}
  @isHiddenGroups={{true}}
  @isHiddenDivisions={{true}}
  @onFilter={{this.noop}}
/>`,
          );

          //then
          assert.ok(screen.getByRole('button', { name: 'Effacer les filtres', hidden: true }));
        });
      });

      module('Campaign type PROFILE_COLLECTION', function () {
        test('it display disabled button', async function (assert) {
          //given
          const campaign = store.createRecord('campaign', {
            type: 'PROFILE_COLLECTION',
          });
          this.set('campaign', campaign);
          this.set('resetFiltering', () => {});
          this.set('searchFilter', null);
          this.set('certificabilityFilter', null);

          //when
          const screen = await render(
            hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onResetFilter={{this.resetFiltering}}
  @searchFilter={{this.searchFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @onFilter={{this.noop}}
/>`,
          );

          //then
          assert.ok(screen.getByRole('button', { name: 'Effacer les filtres', hidden: true }));
        });
      });
    });
  });

  module('stages', function () {
    module('when campaign has no stages', function () {
      test('should not displays the stage filter', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileHasStage: false,
          stages: [],
        });

        this.set('campaign', campaign);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{false}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
/>`,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Paliers' }));
      });
    });

    module('when the campaign has stage but is not assessment type', function () {
      test('it should not displays the stage filter', async function (assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1' });
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          targetProfileHasStage: true,
          stages: [stage],
        });

        this.set('campaign', campaign);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{false}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
/>`,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Paliers' }));
      });
    });

    module('when campaign has stages and has type ASSESSMENT', function () {
      test('it displays the stage filter', async function (assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileHasStage: true,
          stages: [stage],
        });

        this.set('campaign', campaign);
        this.set('selectedStages', []);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{false}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @selectedStages={{this.selectedStages}}
/>`,
        );

        // then
        assert.ok(screen.getByRole('button', { name: 'Paliers' }));
      });

      test('it should not display the stage filter when it specified', async function (assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileHasStage: true,
          stages: [stage],
        });

        this.set('campaign', campaign);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
/>`,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Paliers' }));
      });

      test('it triggers the filter when a stage is selected', async function (assert) {
        // given
        const stage1 = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const stage2 = store.createRecord('stage', { id: 'stage2', threshold: 55 });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileHasStage: true,
          stages: [stage1, stage2],
        });

        const triggerFiltering = sinon.stub();
        this.set('campaign', campaign);
        this.set('triggerFiltering', triggerFiltering);
        this.set('selectedStages', []);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.triggerFiltering}}
  @isHiddenStages={{false}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @selectedStages={{this.selectedStages}}
/>`,
        );

        await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.stages')));
        await click(await screen.findByRole('checkbox', { name: '1 étoile sur 1' }));

        // then
        assert.ok(triggerFiltering.calledWith('stages', ['stage2']));
      });
    });
  });

  module('badges', function () {
    module('when campaign has badges and has type ASSESSMENT', function () {
      test('it displays the badge filter', async function (assert) {
        // given
        const badge = store.createRecord('badge', { title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        this.set('campaign', campaign);
        this.set('selectedBadges', []);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{false}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @selectedBadges={{this.selectedBadges}}
/>`,
        );

        // then
        assert.ok(screen.getByRole('button', { name: 'Thématiques' }));
        assert.ok(screen.getByLabelText('Les bases'));
      });

      test('it should not displays the badge filter when it specified', async function (assert) {
        // given
        const badge = store.createRecord('badge', { title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        this.set('campaign', campaign);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @selectedBadges={{this.selectedBadges}}
/>`,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Thématiques' }));
        assert.notOk(screen.queryByLabelText('Les bases'));
      });

      test('it triggers the filter when a badge is selected', async function (assert) {
        // given
        const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        const triggerFiltering = sinon.stub();
        this.set('campaign', campaign);
        this.set('triggerFiltering', triggerFiltering);
        this.set('selectedBadges', []);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.triggerFiltering}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{false}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @selectedBadges={{this.selectedBadges}}
/>`,
        );

        await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.badges')));
        await click(await screen.findByRole('checkbox', { name: 'Les bases' }));

        // then
        assert.ok(triggerFiltering.calledWith('badges', ['badge1']));
      });
    });

    module('when the campaign has no badge', function () {
      test('should not displays the badge filter', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 0,
          badges: [],
        });

        this.set('campaign', campaign);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Thématiques' }));
      });
    });

    module('when the campaign has badge but is not assessment type', function () {
      test('it should not displays the badge filter', async function (assert) {
        // given
        const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        this.set('campaign', campaign);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Thématiques' }));
      });
    });
  });

  module('status', function () {
    test('it triggers the filter when a status is selected', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: campaignId,
        name: 'campagne 1',
        type: 'ASSESSMENT',
        targetProfileHasStage: false,
        stages: [],
      });

      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('triggerFiltering', triggerFiltering);

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`,
      );
      await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.status.title')));
      await click(
        await screen.findByRole('option', {
          name: this.intl.t('components.participation-status.STARTED-ASSESSMENT'),
        }),
      );

      // then
      assert.ok(triggerFiltering.calledWith('status', 'STARTED'));
    });

    test('it select the option passed as selectedStatus args', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: campaignId,
        name: 'campagne 1',
        type: 'ASSESSMENT',
        targetProfileHasStage: false,
        stages: [],
      });

      this.set('campaign', campaign);

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} @selectedStatus='STARTED' />`,
      );
      await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.status.title')));

      // then
      assert
        .dom(
          await screen.findByRole('option', {
            name: this.intl.t('components.participation-status.STARTED-ASSESSMENT'),
            selected: true,
          }),
        )
        .exists();
    });

    test('it should display 3 statuses for assessment campaign', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: campaignId,
        name: 'campagne 1',
        type: 'ASSESSMENT',
        targetProfileHasStage: false,
        stages: [],
      });

      this.set('campaign', campaign);

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`,
      );

      // then
      await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.status.title')));
      const options = await screen.findAllByRole('option');
      assert.deepEqual(
        options.map((option) => option.innerText),
        [
          this.intl.t('pages.campaign-results.filters.type.status.empty'),
          this.intl.t('components.participation-status.STARTED-ASSESSMENT'),
          this.intl.t('components.participation-status.TO_SHARE-ASSESSMENT'),
          this.intl.t('components.participation-status.SHARED-ASSESSMENT'),
        ],
      );
    });

    test('it should display 2 statuses for profiles collection campaign', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        type: 'PROFILES_COLLECTION',
        targetProfileHasStage: false,
        stages: [],
      });

      this.set('campaign', campaign);

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`,
      );

      // then
      await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.status.title')));
      const options = await screen.findAllByRole('option');
      assert.deepEqual(
        options.map((option) => option.innerText),
        [
          this.intl.t('pages.campaign-results.filters.type.status.empty'),
          this.intl.t('components.participation-status.TO_SHARE-PROFILES_COLLECTION'),
          this.intl.t('components.participation-status.SHARED-PROFILES_COLLECTION'),
        ],
      );
    });
  });

  module('search', function () {
    test('that in the fullname search input we will have the value that we put', async function (assert) {
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
      });
      this.set('campaign', campaign);
      this.set('searchFilter', 'chichi');

      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @searchFilter={{this.searchFilter}}
  @isHiddenStatus={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @onResetFilter={{this.noop}}
  @onFilter={{this.noop}}
/>`,
      );

      // then
      assert.dom(screen.getByLabelText('Recherche sur le nom et prénom')).hasValue('chichi');
    });

    test('it triggers the filter when a text is searched', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: campaignId,
        name: 'campagne 1',
        type: 'ASSESSMENT',
        targetProfileHasStage: false,
        stages: [],
      });

      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('triggerFiltering', triggerFiltering);

      // when
      await render(
        hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`,
      );
      await fillByLabel(this.intl.t('common.filters.fullname.label'), 'Sal');

      // then
      assert.ok(triggerFiltering.calledWith('search', 'Sal'));
    });
  });

  module('certificability', function () {
    test('display certificability filter', async function (assert) {
      const campaign = store.createRecord('campaign', {
        id: '1',
        type: 'PROFILE_COLLECTION',
        name: 'campagne 1',
      });
      this.set('campaign', campaign);

      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @isHiddenSearch={{true}}
  @isHiddenStatus={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @onResetFilter={{this.noop}}
  @onFilter={{this.noop}}
/>`,
      );

      // then
      assert.ok(screen.getByLabelText('Rechercher par certificabilité'));
    });

    test('hide certificability filter on assessment campaign', async function (assert) {
      const campaign = store.createRecord('campaign', {
        id: '1',
        type: 'ASSESSMENT',
        name: 'campagne 1',
      });
      this.set('campaign', campaign);

      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @isHiddenSearch={{true}}
  @isHiddenStatus={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenGroups={{true}}
  @onResetFilter={{this.noop}}
  @onFilter={{this.noop}}
/>`,
      );

      // then
      assert.notOk(screen.queryByLabelText('Rechercher par certificabilité'));
    });

    test('it triggers the filter when a certificability is selected', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: campaignId,
        name: 'campagne 1',
        type: 'PROFILE_COLLECTION',
      });

      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('triggerFiltering', triggerFiltering);

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`,
      );
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.sco-organization-participants.filter.certificability.label'),
        }),
      );
      await screen.findByRole('listbox');

      await click(
        screen.getByRole('option', {
          name: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible'),
        }),
      );

      // then
      assert.ok(triggerFiltering.calledWith('certificability', 'non-eligible'));
    });
  });

  module('when user works for a SCO organization which manages students', function () {
    class CurrentUserStub extends Service {
      isSCOManagingStudents = true;
    }

    module('when there are some divisions', function (hooks) {
      hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        const division = store.createRecord('division', { id: 'd1', name: 'd1' });
        this.campaign = store.createRecord('campaign', { id: '1', divisions: [division] });
        this.set('selectedDivisions', []);
      });

      test('it displays the division filter', async function (assert) {
        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{false}}
  @isHiddenGroups={{true}}
  @selectedDivisions={{this.selectedDivisions}}
/>`,
        );
        // then
        assert.ok(screen.getByRole('textbox', { name: 'Rechercher par classes' }));
        assert.ok(screen.getByLabelText('d1'));
      });

      test('it display disabled button', async function (assert) {
        //given
        this.set('resetFiltering', () => {});
        this.set('selectedDivisions', []);

        //when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onResetFilter={{this.resetFiltering}}
  @selectedDivisions={{this.selectedDivisions}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenGroups={{true}}
  @isHiddenCertificability={{true}}
  @isHiddenSearch={{true}}
  @isHiddenStatus={{true}}
  @onFilter={{this.noop}}
/>`,
        );

        //then
        assert.ok(screen.getByRole('button', { name: 'Effacer les filtres', hidden: true }));
      });

      test('it triggers the filter when a division is selected', async function (assert) {
        const triggerFiltering = sinon.stub();
        this.set('triggerFiltering', triggerFiltering);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.triggerFiltering}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{false}}
  @selectedDivisions={{this.selectedDivisions}}
/>`,
        );
        await click(screen.getByLabelText(this.intl.t('common.filters.divisions.label')));
        await click(
          await screen.findByRole('checkbox', {
            name: 'd1',
          }),
        );

        // then
        assert.ok(triggerFiltering.calledWith('divisions', ['d1']));
      });
    });

    test('it should not display group filter', async function (assert) {
      this.campaign = store.createRecord('campaign', { id: '1' });
      this.set('selectedDivisions', []);
      // when
      const screen = await render(hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{false}}
  @selectedDivisions={{this.selectedDivisions}}
/>`);

      // then
      assert.notOk(screen.queryByRole('button', { name: 'Groupes' }));
    });
  });

  module('when user works for a SUP organization which manages students', function () {
    class CurrentUserStub extends Service {
      isSUPManagingStudents = true;
    }

    module('when there are some groups', function (hooks) {
      hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        const group = store.createRecord('group', { id: 'd1', name: 'd1' });
        this.campaign = store.createRecord('campaign', { id: '1', groups: [group] });
        this.set('selectedGroups', []);
      });

      test('it display disabled button', async function (assert) {
        //given
        this.set('resetFiltering', () => {});
        this.set('selectedGroups', []);

        //when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onResetFilter={{this.resetFiltering}}
  @selectedGroups={{this.selectedGroups}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @isHiddenDivisions={{true}}
  @isHiddenCertificability={{true}}
  @isHiddenSearch={{true}}
  @isHiddenStatus={{true}}
  @onFilter={{this.noop}}
/>`,
        );

        //then
        assert.ok(screen.getByRole('button', { name: 'Effacer les filtres', hidden: true }));
      });

      test('it displays the group filter', async function (assert) {
        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @selectedGroups={{this.selectedGroups}}
/>`,
        );
        // then
        assert.ok(screen.getByRole('textbox', { name: 'Groupes' }));
        assert.ok(screen.getByLabelText('d1'));
      });

      test('it triggers the filter when a group is selected', async function (assert) {
        const triggerFiltering = sinon.stub();

        this.set('triggerFiltering', triggerFiltering);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.triggerFiltering}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @selectedGroups={{this.selectedGroups}}
/>`,
        );

        await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.groups.title')));
        await click(
          await screen.findByRole('checkbox', {
            name: 'd1',
          }),
        );

        // then
        assert.ok(triggerFiltering.calledWith('groups', ['d1']));
      });
    });

    test('it does not display the division filter', async function (assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd2',
        name: 'd2',
      });
      this.set('selectedGroups', []);
      this.campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        divisions: [division],
      });

      // when
      const screen = await render(
        hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onFilter={{this.noop}}
  @isHiddenStages={{true}}
  @isHiddenBadges={{true}}
  @selectedGroups={{this.selectedGroups}}
/>`,
      );

      // then
      assert.notOk(screen.queryByRole('textbox', { name: 'Rechercher par classes' }));
      assert.notOk(screen.queryByLabelText('d2'));
    });
  });
});
