import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';
import { render, clickByName, fillByLabel } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';

module('Integration | Component | Campaign::Filter::ParticipationFilters', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;
  const campaignId = 1;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.set('noop', sinon.stub());
  });

  module('filters for all organizations', function () {
    module('when campaign does not need filters', function () {
      test('it should not display anything', async function (assert) {
        const campaign = store.createRecord('campaign', { id: campaignId });
        this.set('campaign', campaign);

        // when
        await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @isHiddenStatus={{true}} @isHiddenSearch={{true}} />`
        );

        // then
        assert.notContains('Filtres');
      });
    });
    module('display number of filtered participants as Pix filter banner details', function () {
      test('it should display one filtered participant', async function (assert) {
        // given
        const badge = store.createRecord('badge');
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileHasStage: true,
          badges: [badge],
        });
        const rowCount = 1;
        this.set('campaign', campaign);
        this.set('rowCount', rowCount);

        // when
        await render(hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @rowCount={{this.rowCount}}
  @onFilter={{this.noop}}
/>`);

        // then
        assert.contains('1 participant');
      });

      test('it should display many filtered participant', async function (assert) {
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
        await render(hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @rowCount={{this.details}}
  @onFilter={{this.noop}}
/>`);

        // then
        assert.contains('2 participants');
      });

      module('when there is a reset Filter button', function () {
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

          //when
          await render(hbs`<Campaign::Filter::ParticipationFilters
  @campaign={{this.campaign}}
  @onResetFilter={{this.resetFiltering}}
  @onFilter={{this.noop}}
/>`);
          await clickByName('Effacer les filtres');

          //then
          assert.ok(resetFiltering.called);
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
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
          );

          // then
          assert.notContains('Paliers');
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
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
          );

          // then
          assert.notContains('Paliers');
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

          // when
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
          );

          // then
          assert.contains('Paliers');
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
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @isHiddenStages={{true}} @onFilter={{this.noop}} />`
          );

          // then
          assert.notContains('Paliers');
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

          // when
          const screen = await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`
          );

          await click(screen.getByLabelText(t('pages.campaign-results.filters.type.stages')));
          await click(await screen.findByRole('checkbox', { name: '1 étoiles sur 1' }));

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

          // when
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
          );

          // then
          assert.contains('Thématiques');
          assert.contains('Les bases');
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
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @isHiddenBadges={{true}} @onFilter={{this.noop}} />`
          );

          // then
          assert.notContains('Thématiques');
          assert.notContains('Les bases');
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

          // when
          const screen = await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`
          );

          await click(screen.getByLabelText(t('pages.campaign-results.filters.type.badges')));
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
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
          );

          // then
          assert.notContains('Thématiques');
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
          await render(
            hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
          );

          // then
          assert.notContains('Thématiques');
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
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`
        );
        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.status.title')));
        await click(
          await screen.findByRole('option', {
            name: t('components.participation-status.STARTED-ASSESSMENT'),
          })
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
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} @selectedStatus='STARTED' />`
        );
        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.status.title')));

        // then
        assert
          .dom(
            await screen.findByRole('option', {
              name: t('components.participation-status.STARTED-ASSESSMENT'),
              selected: true,
            })
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
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
        );

        // then
        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.status.title')));
        const options = await screen.findAllByRole('option');
        assert.deepEqual(
          options.map((option) => option.innerText),
          [
            t('pages.campaign-results.filters.type.status.empty'),
            t('components.participation-status.STARTED-ASSESSMENT'),
            t('components.participation-status.TO_SHARE-ASSESSMENT'),
            t('components.participation-status.SHARED-ASSESSMENT'),
          ]
        );
      });

      test('it should display 2 statuses for profiles collection campaign', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          id: 1,
          name: 'campagne 1',
          type: 'PROFILES_COLLECTION',
          targetProfileHasStage: false,
          stages: [],
        });

        this.set('campaign', campaign);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
        );

        // then
        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.status.title')));
        const options = await screen.findAllByRole('option');
        assert.deepEqual(
          options.map((option) => option.innerText),
          [
            t('pages.campaign-results.filters.type.status.empty'),
            t('components.participation-status.TO_SHARE-PROFILES_COLLECTION'),
            t('components.participation-status.SHARED-PROFILES_COLLECTION'),
          ]
        );
      });
    });

    module('search', function () {
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
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`
        );
        await fillByLabel(t('pages.campaign-results.filters.type.search.title'), 'Sal');

        // then
        assert.ok(triggerFiltering.calledWith('search', 'Sal'));
      });
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
        this.campaign = store.createRecord('campaign', { id: 1, divisions: [division] });
      });

      test('it displays the division filter', async function (assert) {
        // when
        await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
        );
        // then
        assert.contains('Classes');
        assert.contains('d1');
      });

      test('it triggers the filter when a division is selected', async function (assert) {
        const triggerFiltering = sinon.stub();
        this.set('triggerFiltering', triggerFiltering);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`
        );
        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.divisions.placeholder')));
        await click(
          await screen.findByRole('checkbox', {
            name: 'd1',
          })
        );

        // then
        assert.ok(triggerFiltering.calledWith('divisions', ['d1']));
      });
    });

    test('it should not display group filter', async function (assert) {
      this.campaign = store.createRecord('campaign', { id: 1 });
      // when
      await render(hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`);

      // then
      assert.notContains('Groupes');
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
        this.campaign = store.createRecord('campaign', { id: 1, groups: [group] });
      });

      test('it displays the group filter', async function (assert) {
        // when
        await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`
        );
        // then
        assert.contains('Groupes');
        assert.contains('d1');
      });

      test('it triggers the filter when a group is selected', async function (assert) {
        const triggerFiltering = sinon.stub();

        this.set('triggerFiltering', triggerFiltering);

        // when
        const screen = await render(
          hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`
        );
        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.groups.title')));
        await click(
          await screen.findByRole('checkbox', {
            name: 'd1',
          })
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
      this.campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        divisions: [division],
      });

      // when
      await render(hbs`<Campaign::Filter::ParticipationFilters @campaign={{this.campaign}} @onFilter={{this.noop}} />`);

      // then
      assert.notContains('Classes');
      assert.notContains('d2');
    });
  });
});
