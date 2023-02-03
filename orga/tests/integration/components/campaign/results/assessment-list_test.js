import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { clickByName, render, fillByLabel } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import sinon from 'sinon';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Results::AssessmentList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.set('noop', sinon.stub());
  });

  test('it should display a link to access to result page', async function (assert) {
    // given
    this.owner.setupRouter();
    const campaign = store.createRecord('campaign', { id: 1 });

    const participations = [
      {
        id: 5,
        lastName: 'Midoriya',
        firstName: 'Izoku',
      },
    ];

    this.set('campaign', campaign);
    this.set('participations', participations);

    // when
    await render(
      hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
    );

    // then
    assert.dom('a[href="/campagnes/1/evaluations/5"]').exists();
  });

  module('when a participant has shared his results', function () {
    test('it should display the participant’s results', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        participationsCount: 1,
      });

      const participations = [
        {
          firstName: 'John',
          lastName: 'Doe',
          masteryRate: 0.8,
          isShared: true,
        },
      ];
      participations.meta = {
        rowCount: 1,
      };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.notContains('Aucun participant');
      assert.contains('Doe');
      assert.contains('John');
      assert.contains('80 %');
    });

    test('it should display badge and tooltip', async function (assert) {
      // given
      const badge = store.createRecord('badge', { id: 1, imageUrl: 'url-badge' });
      const campaign = store.createRecord('campaign', {
        targetProfileThematicResultCount: 1,
        badges: [badge],
      });

      const participations = [{ badges: [badge], isShared: true }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.dom('[aria-describedby="badge-tooltip-1"]').exists();
      assert.dom('img[src="url-badge"]').exists();
    });
  });

  module('when the campaign asked for an external id', function () {
    test("it should display participant's results with external id", async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        idPixLabel: 'identifiant externe',
      });

      const participations = [{ participantExternalId: '123' }];
      participations.meta = {
        rowCount: 1,
      };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.contains('identifiant externe');
      assert.contains('123');
    });
  });

  module('when nobody shared his results', function () {
    test('it should display "waiting for participants"', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        name: 'campagne 1',
      });

      const participations = [];
      participations.meta = {
        rowCount: 0,
      };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.contains('Aucune participation');
    });
  });

  module('when the campaign doesn‘t have thematic results', function () {
    test('it should not display thematic results column', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        targetProfileThematicResultCount: 0,
        badges: [],
      });

      const participations = [{}];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.notContains('Résultats Thématiques');
    });
  });

  module('when the campaign has thematic results', function () {
    test('it should display thematic results column', async function (assert) {
      // given
      const badge = store.createRecord('badge');
      const campaign = store.createRecord('campaign', {
        targetProfileThematicResultCount: 1,
        badges: [badge],
      });

      const participations = [{}];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.contains('Résultats Thématiques');
    });

    test('it filters the participations when a thematic results is selected', async function (assert) {
      // given
      const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
      const campaign = store.createRecord('campaign', {
        type: 'ASSESSMENT',
        targetProfileThematicResultCount: 1,
        badges: [badge],
      });

      const participations = [{ firstName: 'John', lastName: 'Doe', masteryRate: 0.6, isShared: true }];
      participations.meta = { rowCount: 1 };
      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('triggerFiltering', triggerFiltering);

      // when
      const screen = await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.triggerFiltering}}
/>`
      );

      await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.badges')));
      await click(await screen.findByRole('checkbox', { name: 'Les bases' }));

      // then
      assert.ok(triggerFiltering.calledWith('badges', ['badge1']));
    });
  });

  module('when the campaign has stages', function () {
    test('it should display stars instead of mastery percentage in result column', async function (assert) {
      // given
      const stage = store.createRecord('stage', { threshold: 50 });
      const campaign = store.createRecord('campaign', {
        targetProfileHasStage: true,
        stages: [stage],
      });

      const participations = [{ masteryRate: 0.6, isShared: true }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.notContains('60%');
      assert.dom('.pix-stars').exists();
    });
  });

  module('when user works for a SCO organization which manages students', function () {
    class CurrentUserStub extends Service {
      isSCOManagingStudents = true;
    }

    test('it filter the participations when a division is selected', async function (assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });
      campaign.set('divisions', [division]);

      const participations = [{ firstName: 'John', lastName: 'Doe', masteryRate: 0.6 }];
      participations.meta = { rowCount: 1 };
      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('triggerFiltering', triggerFiltering);

      // when
      const screen = await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.triggerFiltering}}
/>`
      );

      await click(screen.getByLabelText(this.intl.t('pages.campaign-results.filters.type.divisions.placeholder')));
      await click(await screen.findByRole('checkbox', { name: 'd1' }));

      // then
      assert.ok(triggerFiltering.calledWith('divisions', ['d1']));
    });
  });

  module('when user reset current filters', function () {
    class CurrentUserStub extends Service {
      isSCOManagingStudents = true;
    }

    test('it calls the onResetFilter callback', async function (assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });
      campaign.set('divisions', [division]);

      const participations = [{ firstName: 'John', lastName: 'Doe', masteryRate: 0.6 }];
      participations.meta = { rowCount: 1 };
      const resetFilters = sinon.stub();
      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('resetFilters', resetFilters);

      // when
      await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
  @onResetFilter={{this.resetFilters}}
/>`
      );
      await clickByName('Effacer les filtres');

      // then
      assert.ok(resetFilters.called);
    });
  });

  module('when user set a search filter', function () {
    test('that in the fullname search input we will have the value that we put', async function (assert) {
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });
      this.set('campaign', campaign);
      this.set('searchFilter', 'chichi');
      const screen = await render(
        hbs`<Campaign::Results::AssessmentList
  @campaign={{this.campaign}}
  @searchFilter={{this.searchFilter}}
  @onFilter={{this.noop}}
/>`
      );

      // then
      assert.dom(screen.getByLabelText('Recherche sur le nom et prénom')).hasValue('chichi');
    });

    test('that while filling the search input we will trigger the filtering', async function (assert) {
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });
      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('triggerFiltering', triggerFiltering);
      await render(
        hbs`<Campaign::Results::AssessmentList @campaign={{this.campaign}} @onFilter={{this.triggerFiltering}} />`
      );
      await fillByLabel('Recherche sur le nom et prénom', 'Chichi');
      // then
      assert.ok(triggerFiltering.calledWith('search', 'Chichi'));
    });
  });
});
