import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ParticipationFilters from 'pix-orga/components/campaign/filter/participation-filters';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Filter::ParticipationFilters', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;
  const campaignId = '1';
  const noop = () => {};

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('Basic Filter State', function () {
    test('it should display one filtered participant', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        type: 'ASSESSMENT',
      });
      const rowCount = 1;

      // when
      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @rowCount={{rowCount}}
            @onFilter={{noop}}
            @isHiddenStages={{true}}
            @isHiddenBadges={{true}}
            @isHiddenDivisions={{true}}
            @isHiddenGroups={{true}}
          />
        </template>,
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

      // when
      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @rowCount={{rowCount}}
            @onFilter={{noop}}
            @isHiddenStages={{true}}
            @isHiddenBadges={{true}}
            @isHiddenDivisions={{true}}
            @isHiddenGroups={{true}}
          />
        </template>,
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
        const searchFilter = 'toto';

        //when
        await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onResetFilter={{resetFiltering}}
              @searchFilter={{searchFilter}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
            />
          </template>,
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
          const resetFiltering = () => {};
          const searchFilter = null;
          const searchBadges = [];
          const searchStages = [];
          const selectedStages = [];
          const selectedBadges = [];
          const selectedUnacquiredBadges = [];

          //when
          const screen = await render(
            <template>
              <ParticipationFilters
                @campaign={{campaign}}
                @onResetFilter={{resetFiltering}}
                @searchFilter={{searchFilter}}
                @searchBadges={{searchBadges}}
                @searchStages={{searchStages}}
                @selectedStages={{selectedStages}}
                @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
                @selectedBadges={{selectedBadges}}
                @isHiddenGroups={{true}}
                @isHiddenDivisions={{true}}
                @onFilter={{noop}}
              />
            </template>,
          );

          //then
          assert.ok(screen.getByRole('button', { name: 'Effacer les filtres', hidden: true }));
        });
      });

      module('Campaign type EXAM', function () {
        test('it display disabled button', async function (assert) {
          //given
          const badge = store.createRecord('badge');
          const stage = store.createRecord('stage');

          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            targetProfileHasStage: true,
            targetProfileThematicResultCount: 2,
            badges: [badge],
            stages: [stage],
          });
          const resetFiltering = () => {};
          const searchFilter = null;
          const searchBadges = [];
          const searchStages = [];
          const selectedStages = [];
          const selectedBadges = [];
          const selectedUnacquiredBadges = [];

          //when
          const screen = await render(
            <template>
              <ParticipationFilters
                @campaign={{campaign}}
                @onResetFilter={{resetFiltering}}
                @searchFilter={{searchFilter}}
                @searchBadges={{searchBadges}}
                @searchStages={{searchStages}}
                @selectedStages={{selectedStages}}
                @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
                @selectedBadges={{selectedBadges}}
                @isHiddenGroups={{true}}
                @isHiddenDivisions={{true}}
                @onFilter={{noop}}
              />
            </template>,
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
          const resetFiltering = () => {};
          const searchFilter = null;
          const certificabilityFilter = null;

          //when
          const screen = await render(
            <template>
              <ParticipationFilters
                @campaign={{campaign}}
                @onResetFilter={{resetFiltering}}
                @searchFilter={{searchFilter}}
                @certificabilityFilter={{certificabilityFilter}}
                @onFilter={{noop}}
              />
            </template>,
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

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{false}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
            />
          </template>,
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

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{false}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
            />
          </template>,
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

        const selectedStages = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{false}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedStages={{selectedStages}}
            />
          </template>,
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

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
            />
          </template>,
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
        const selectedStages = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{false}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedStages={{selectedStages}}
            />
          </template>,
        );

        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.stages')));
        await click(await screen.findByRole('checkbox', { name: '1 étoile sur 1' }));

        // then
        assert.ok(triggerFiltering.calledWith('stages', ['stage2']));
      });
    });

    module('when campaign has stages and has type EXAM', function () {
      test('it displays the stage filter', async function (assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileHasStage: true,
          stages: [stage],
        });

        const selectedStages = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{false}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedStages={{selectedStages}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByRole('button', { name: 'Paliers' }));
      });

      test('it should not display the stage filter when it specified', async function (assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileHasStage: true,
          stages: [stage],
        });

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
            />
          </template>,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Paliers' }));
      });

      test('it triggers the filter when a stage is selected', async function (assert) {
        // given
        const stage1 = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const stage2 = store.createRecord('stage', { id: 'stage2', threshold: 55 });
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileHasStage: true,
          stages: [stage1, stage2],
        });

        const triggerFiltering = sinon.stub();
        const selectedStages = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{false}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedStages={{selectedStages}}
            />
          </template>,
        );

        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.stages')));
        await click(await screen.findByRole('checkbox', { name: '1 étoile sur 1' }));

        // then
        assert.ok(triggerFiltering.calledWith('stages', ['stage2']));
      });
    });
  });

  module('badges', function () {
    module('when campaign has badges and has type ASSESSMENT', function () {
      test('it displays the badge filters', async function (assert) {
        // given
        const badge = store.createRecord('badge', { title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        const selectedBadges = [];
        const selectedUnacquiredBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{false}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
              @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByRole('button', { name: t('pages.campaign-results.filters.type.badges') }));
        assert.ok(screen.getByRole('button', { name: t('pages.campaign-results.filters.type.unacquired-badges') }));
      });

      test('it should not displays the badge filter when it specified', async function (assert) {
        // given
        const badge = store.createRecord('badge', { title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });
        const selectedBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
            />
          </template>,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Badges' }));
        assert.notOk(screen.queryByLabelText('Les bases'));
      });

      test('it triggers the filter when an unacquired badge is selected', async function (assert) {
        // given
        const unacquiredBadge = store.createRecord('badge', { id: 'badge1', title: 'La base' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 1,
          badges: [unacquiredBadge],
        });

        const triggerFiltering = sinon.stub();
        const selectedUnacquiredBadges = [];
        const selectedBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{false}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
              @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
            />
          </template>,
        );
        const button = await screen.findByRole('button', {
          name: t('pages.campaign-results.filters.type.unacquired-badges'),
        });

        await click(button);
        await click(await screen.findByRole('checkbox', { name: 'La base' }));

        // then
        assert.ok(triggerFiltering.calledWith('unacquiredBadges', ['badge1']));
      });

      test('it triggers the filter when an acquired badge is selected', async function (assert) {
        // given
        const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        const triggerFiltering = sinon.stub();
        const selectedBadges = [];
        const selectedUnacquiredBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{false}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
              @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
            />
          </template>,
        );

        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.badges')));
        await click(await screen.findByRole('checkbox', { name: 'Les bases' }));

        // then
        assert.ok(triggerFiltering.calledWith('badges', ['badge1']));
      });
    });

    module('when campaign has badges and has type EXAM', function () {
      test('it displays the badge filters', async function (assert) {
        // given
        const badge = store.createRecord('badge', { title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        const selectedBadges = [];
        const selectedUnacquiredBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{false}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
              @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByRole('button', { name: t('pages.campaign-results.filters.type.badges') }));
        assert.ok(screen.getByRole('button', { name: t('pages.campaign-results.filters.type.unacquired-badges') }));
      });

      test('it should not displays the badge filter when it specified', async function (assert) {
        // given
        const badge = store.createRecord('badge', { title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });
        const selectedBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
            />
          </template>,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Badges' }));
        assert.notOk(screen.queryByLabelText('Les bases'));
      });

      test('it triggers the filter when an unacquired badge is selected', async function (assert) {
        // given
        const unacquiredBadge = store.createRecord('badge', { id: 'badge1', title: 'La base' });
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileThematicResultCount: 1,
          badges: [unacquiredBadge],
        });

        const triggerFiltering = sinon.stub();
        const selectedUnacquiredBadges = [];
        const selectedBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{false}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
              @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
            />
          </template>,
        );
        const button = await screen.findByRole('button', {
          name: t('pages.campaign-results.filters.type.unacquired-badges'),
        });

        await click(button);
        await click(await screen.findByRole('checkbox', { name: 'La base' }));

        // then
        assert.ok(triggerFiltering.calledWith('unacquiredBadges', ['badge1']));
      });

      test('it triggers the filter when an acquired badge is selected', async function (assert) {
        // given
        const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileThematicResultCount: 1,
          badges: [badge],
        });

        const triggerFiltering = sinon.stub();
        const selectedBadges = [];
        const selectedUnacquiredBadges = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{false}}
              @isHiddenDivisions={{true}}
              @isHiddenGroups={{true}}
              @selectedBadges={{selectedBadges}}
              @selectedUnacquiredBadges={{selectedUnacquiredBadges}}
            />
          </template>,
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

        // when
        const screen = await render(
          <template><ParticipationFilters @campaign={{campaign}} @onFilter={{noop}} /></template>,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Badges' }));
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

        // when
        const screen = await render(
          <template><ParticipationFilters @campaign={{campaign}} @onFilter={{noop}} /></template>,
        );

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Badges' }));
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

      // when
      const screen = await render(
        <template><ParticipationFilters @campaign={{campaign}} @onFilter={{triggerFiltering}} /></template>,
      );
      await click(screen.getByLabelText(t('pages.campaign-results.filters.type.status.title')));
      await click(
        await screen.findByRole('option', {
          name: t('components.participation-status.STARTED'),
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

      // when
      const screen = await render(
        <template>
          <ParticipationFilters @campaign={{campaign}} @onFilter={{noop}} @selectedStatus="STARTED" />
        </template>,
      );
      await click(screen.getByLabelText(t('pages.campaign-results.filters.type.status.title')));

      // then
      assert
        .dom(
          await screen.findByRole('option', {
            name: t('components.participation-status.STARTED'),
            selected: true,
          }),
        )
        .exists();
    });

    test('it should display statuses', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: campaignId,
        name: 'campagne 1',
        type: 'ASSESSMENT',
        targetProfileHasStage: false,
        stages: [],
      });

      // when
      const screen = await render(
        <template><ParticipationFilters @campaign={{campaign}} @onFilter={{noop}} /></template>,
      );

      // then
      await click(screen.getByLabelText(t('pages.campaign-results.filters.type.status.title')));
      const options = await screen.findAllByRole('option');
      assert.deepEqual(
        options.map((option) => option.innerText),
        [
          t('pages.campaign-results.filters.type.status.empty'),
          t('components.participation-status.STARTED'),
          t('components.participation-status.SHARED'),
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
      const searchFilter = 'chichi';

      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @searchFilter={{searchFilter}}
            @isHiddenStatus={{true}}
            @isHiddenBadges={{true}}
            @isHiddenDivisions={{true}}
            @isHiddenGroups={{true}}
            @onResetFilter={{noop}}
            @onFilter={{noop}}
          />
        </template>,
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

      // when
      await render(<template><ParticipationFilters @campaign={{campaign}} @onFilter={{triggerFiltering}} /></template>);
      await fillByLabel(t('common.filters.fullname.label'), 'Sal');

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

      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @isHiddenSearch={{true}}
            @isHiddenStatus={{true}}
            @isHiddenBadges={{true}}
            @isHiddenDivisions={{true}}
            @isHiddenGroups={{true}}
            @onResetFilter={{noop}}
            @onFilter={{noop}}
          />
        </template>,
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

      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @isHiddenSearch={{true}}
            @isHiddenStatus={{true}}
            @isHiddenBadges={{true}}
            @isHiddenDivisions={{true}}
            @isHiddenGroups={{true}}
            @onResetFilter={{noop}}
            @onFilter={{noop}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByLabelText('Rechercher par certificabilité'));
    });

    test('hide certificability filter on exam campaign', async function (assert) {
      const campaign = store.createRecord('campaign', {
        id: '1',
        type: 'EXAM',
        name: 'campagne 1',
      });

      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @isHiddenSearch={{true}}
            @isHiddenStatus={{true}}
            @isHiddenBadges={{true}}
            @isHiddenDivisions={{true}}
            @isHiddenGroups={{true}}
            @onResetFilter={{noop}}
            @onFilter={{noop}}
          />
        </template>,
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

      // when
      const screen = await render(
        <template><ParticipationFilters @campaign={{campaign}} @onFilter={{triggerFiltering}} /></template>,
      );
      await click(
        screen.getByRole('button', {
          name: t('pages.sco-organization-participants.filter.certificability.label'),
        }),
      );
      await screen.findByRole('listbox');

      await click(
        screen.getByRole('option', {
          name: t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible'),
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

    module('when there are some divisions', function () {
      test('it displays the division filter', async function (assert) {
        // given
        const division = store.createRecord('division', { id: 'd1', name: 'd1' });
        const campaign = store.createRecord('campaign', { id: '1', divisions: [division] });
        this.owner.register('service:current-user', CurrentUserStub);
        const selectedDivisions = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{false}}
              @isHiddenGroups={{true}}
              @selectedDivisions={{selectedDivisions}}
            />
          </template>,
        );
        // then
        assert.ok(screen.getByRole('textbox', { name: 'Rechercher par classes' }));
        assert.ok(screen.getByLabelText('d1'));
      });

      test('it display disabled button', async function (assert) {
        // given
        const division = store.createRecord('division', { id: 'd1', name: 'd1' });
        const campaign = store.createRecord('campaign', { id: '1', divisions: [division] });
        this.owner.register('service:current-user', CurrentUserStub);
        const resetFiltering = () => {};
        const selectedDivisions = [];

        //when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onResetFilter={{resetFiltering}}
              @selectedDivisions={{selectedDivisions}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenGroups={{true}}
              @isHiddenCertificability={{true}}
              @isHiddenSearch={{true}}
              @isHiddenStatus={{true}}
              @onFilter={{noop}}
            />
          </template>,
        );

        //then
        assert.ok(screen.getByRole('button', { name: 'Effacer les filtres', hidden: true }));
      });

      test('it triggers the filter when a division is selected', async function (assert) {
        // given
        const division = store.createRecord('division', { id: 'd1', name: 'd1' });
        const campaign = store.createRecord('campaign', { id: '1', divisions: [division] });
        this.owner.register('service:current-user', CurrentUserStub);
        const selectedDivisions = [];
        const triggerFiltering = sinon.stub();

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{false}}
              @selectedDivisions={{selectedDivisions}}
            />
          </template>,
        );
        await click(screen.getByLabelText(t('common.filters.divisions.label')));
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
      // given
      const division = store.createRecord('division', { id: 'd1', name: 'd1' });
      const campaign = store.createRecord('campaign', { id: '1', divisions: [division] });
      this.owner.register('service:current-user', CurrentUserStub);
      const selectedDivisions = [];

      // when
      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @onFilter={{noop}}
            @isHiddenStages={{true}}
            @isHiddenBadges={{true}}
            @isHiddenDivisions={{false}}
            @selectedDivisions={{selectedDivisions}}
          />
        </template>,
      );

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
      });

      test('it display disabled button', async function (assert) {
        //given
        const group = store.createRecord('group', { id: 'd1', name: 'd1' });
        const campaign = store.createRecord('campaign', { id: '1', groups: [group] });
        const resetFiltering = () => {};
        const selectedGroups = [];

        //when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onResetFilter={{resetFiltering}}
              @selectedGroups={{selectedGroups}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @isHiddenDivisions={{true}}
              @isHiddenCertificability={{true}}
              @isHiddenSearch={{true}}
              @isHiddenStatus={{true}}
              @onFilter={{noop}}
            />
          </template>,
        );

        //then
        assert.ok(screen.getByRole('button', { name: 'Effacer les filtres', hidden: true }));
      });

      test('it displays the group filter', async function (assert) {
        // given
        const group = store.createRecord('group', { id: 'd1', name: 'd1' });
        const campaign = store.createRecord('campaign', { id: '1', groups: [group] });
        const selectedGroups = [];

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{noop}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @selectedGroups={{selectedGroups}}
            />
          </template>,
        );
        // then
        assert.ok(screen.getByRole('textbox', { name: 'Groupes' }));
        assert.ok(screen.getByLabelText('d1'));
      });

      test('it triggers the filter when a group is selected', async function (assert) {
        // given
        const group = store.createRecord('group', { id: 'd1', name: 'd1' });
        const campaign = store.createRecord('campaign', { id: '1', groups: [group] });
        const selectedGroups = [];
        const triggerFiltering = sinon.stub();

        // when
        const screen = await render(
          <template>
            <ParticipationFilters
              @campaign={{campaign}}
              @onFilter={{triggerFiltering}}
              @isHiddenStages={{true}}
              @isHiddenBadges={{true}}
              @selectedGroups={{selectedGroups}}
            />
          </template>,
        );

        await click(screen.getByLabelText(t('pages.campaign-results.filters.type.groups.title')));
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
      // given
      this.owner.register('service:current-user', CurrentUserStub);

      const division = store.createRecord('division', {
        id: 'd2',
        name: 'd2',
      });
      const selectedGroups = [];
      const campaign = store.createRecord('campaign', {
        id: '1',
        name: 'campagne 1',
        divisions: [division],
      });

      // when
      const screen = await render(
        <template>
          <ParticipationFilters
            @campaign={{campaign}}
            @onFilter={{noop}}
            @isHiddenStages={{true}}
            @isHiddenBadges={{true}}
            @selectedGroups={{selectedGroups}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByRole('textbox', { name: 'Rechercher par classes' }));
      assert.notOk(screen.queryByLabelText('d2'));
    });
  });
});
