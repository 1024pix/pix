import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Campaign::Results::AssessmentList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.set('noop', sinon.stub());
    this.set('groups', []);
    this.set('badges', []);
    this.set('stages', []);
    this.set('divisions', []);
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
      );

      // then
      assert.contains('Résultats Thématiques');
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
  @selectedDivisions={{this.divisions}}
  @selectedGroups={{this.groups}}
  @selectedBadges={{this.badges}}
  @selectedStages={{this.stages}}
/>`,
      );

      // then
      assert.notContains('60%');
      assert.dom('.pix-stars').exists();
    });
  });
});
