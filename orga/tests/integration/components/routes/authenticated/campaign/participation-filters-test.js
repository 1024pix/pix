import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';
import clickByLabel from '../../../../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | routes/authenticated/campaign/participation-filters', (hooks) => {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  module('when campaign does not need filters', () => {
    test('it should not display anything', async function(assert) {
      const campaign = store.createRecord('campaign', { id: 1 });
      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} />`);

      // then
      assert.notContains('Filtres');
    });
  });

  module('when user works for a SCO organization which manages students', () => {
    class CurrentUserStub extends Service {
      prescriber = { areNewYearSchoolingRegistrationsImported: false };
      isSCOManagingStudents = true;
    }

    test('it displays the division filter', async function(assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
      });
      campaign.set('divisions', [division]);
      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} />`);
      // then
      assert.contains('Classes');
      assert.contains('d1');
    });

    test('it triggers the filter when a division is selected', async function(assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        stages: [],
      });
      campaign.set('divisions', [division]);

      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('triggerFiltering', triggerFiltering);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} @triggerFiltering={{triggerFiltering}}/>`);
      await click('[for="division-d1"]');

      // then
      assert.ok(triggerFiltering.calledWith({ divisions: ['d1'] }));
    });
  });

  module('when user does not work for a SCO organization which manages students', () => {
    class CurrentUserStub extends Service {
      prescriber = { areNewYearSchoolingRegistrationsImported: false };
      isSCOManagingStudents = false;
    }

    test('it does not display the division filter', async function(assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd2',
        name: 'd2',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        stages: [],
        divisions: [division],
      });

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} />`);

      // then
      assert.notContains('Classes');
      assert.notContains('d2');
    });

    module('when campaign has badges and has type ASSESSMENT', () => {
      test('it displays the badge filter', async function(assert) {
        // given
        const badge = store.createRecord('badge', { title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          badges: [badge],
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}}/>`);

        // then
        assert.contains('Thématiques');
        assert.contains('Les bases');
      });

      test('it triggers the filter when a badge is selected', async function(assert) {
        // given
        const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          badges: [badge],
        });

        const triggerFiltering = sinon.stub();
        this.set('campaign', campaign);
        this.set('triggerFiltering', triggerFiltering);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} @triggerFiltering={{triggerFiltering}} />`);
        await click('[for="badge-badge1"]');

        // then
        assert.ok(triggerFiltering.calledWith({ badges: ['badge1'] }));
      });
    });

    module('when the campaign has no badge', () => {
      test('should not displays the badge filter', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          badges: [],
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} />`);

        // then
        assert.notContains('Thématiques');
      });
    });

    module('when the campaign has badge but is not assessment type', () => {
      test('it should not displays the badge filter', async function(assert) {
        // given
        const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          badges: [badge],
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} />`);

        // then
        assert.notContains('Thématiques');
      });
    });

    module('when campaign has no stages', () => {
      test('should not displays the stage filter', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          stages: [],
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} />`);

        // then
        assert.notContains('Paliers');
      });
    });

    module('when the campaign has stage but is not assessment type', () => {
      test('it should not displays the stage filter', async function(assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1' });
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          stages: [stage],
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} />`);

        // then
        assert.notContains('Paliers');
      });
    });

    module('when campaign has stages and has type ASSESSMENT', () => {
      test('it displays the stage filter', async function(assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          stages: [stage],
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}}/>`);

        // then
        assert.contains('Paliers');
      });

      test('it triggers the filter when a stage is selected', async function(assert) {
        // given
        const stage = store.createRecord('stage', { id: 'stage1', threshold: 40 });
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          stages: [stage],
        });

        const triggerFiltering = sinon.stub();
        this.set('campaign', campaign);
        this.set('triggerFiltering', triggerFiltering);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters @campaign={{campaign}} @triggerFiltering={{triggerFiltering}} />`);
        await click('[for="stage-stage1"]');

        // then
        assert.ok(triggerFiltering.calledWith({ stages: ['stage1'] }));
      });
    });

    module('display number of filtered participants as Pix filter banner details', () => {
      test('it should display one filtered participant', async function(assert) {
        // given
        const badge = store.createRecord('badge');
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          badges: [badge],
        });
        const rowCount = 1;
        this.set('campaign', campaign);
        this.set('rowCount', rowCount);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters
                            @campaign={{campaign}}
                            @rowCount={{rowCount}}
                          />`);

        // then
        assert.contains('1 participant');
      });

      test('it should display many filtered participant', async function(assert) {
        // given
        const badge = store.createRecord('badge');
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          badges: [badge],
        });
        const rowCount = 2;

        const triggerFiltering = sinon.stub();
        this.set('campaign', campaign);
        this.set('triggerFiltering', triggerFiltering);
        this.set('details', rowCount);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters
                            @campaign={{campaign}}
                            @rowCount={{details}}
                          />`);

        // then
        assert.contains('2 participants');
      });

      module('when there is a reset Filter button', () => {
        test('it triggers the reset filters button when user has clicked', async function(assert) {
          //given
          const badge = store.createRecord('badge');
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            badges: [badge],
          });
          const resetFiltering = sinon.stub();
          this.set('campaign', campaign);
          this.set('resetFiltering', resetFiltering);

          //when
          await render(hbs`<Routes::Authenticated::Campaign::ParticipationFilters
                            @campaign={{campaign}}
                            @resetFiltering={{resetFiltering}}
                          />`);
          await clickByLabel('Effacer les filtres');

          //then
          assert.ok(resetFiltering.called);
        });
      });
    });
  });
});
