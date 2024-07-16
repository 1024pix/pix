import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

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
    const campaign = store.createRecord('campaign', { id: '1' });

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
    const screen = await render(
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
    assert.ok(screen.getByRole('link', { href: '/campagnes/1/evaluations/5' }));
  });

  module('when a participant has shared his results', function () {
    test('it should display the participant’s results', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: '1',
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
      const screen = await render(
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
      assert.notOk(screen.queryByText(t('pages.campaign-results.table.empty')));
      assert.ok(screen.getByRole('cell', { name: 'Doe' }));
      assert.ok(screen.getByRole('cell', { name: 'John' }));
      assert.ok(
        screen.getByRole('cell', {
          name: t('common.result.percentage', { value: 0.8, exact: false }),
        }),
      );
    });

    test('it should display badge and tooltip', async function (assert) {
      // given
      const badge = store.createRecord('badge', { id: '1', imageUrl: 'url-badge', title: 'je suis un badge' });
      const campaign = store.createRecord('campaign', {
        targetProfileThematicResultCount: 1,
        badges: [badge],
      });

      const participations = [{ badges: [badge], isShared: true }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      const screen = await render(
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
      assert.ok(screen.getByRole('img', { src: 'url-badge', description: 'je suis un badge' }));
    });

    module('campaign has multiple sending enabled', function () {
      test('it should display shared result count header', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          multipleSendings: true,
        });

        this.set('campaign', campaign);
        this.set('participations', []);

        // when
        const screen = await render(
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
        assert.ok(screen.getByText(t('pages.campaign-results.table.column.sharedResultCount')));
        assert.ok(screen.getByLabelText(t('pages.campaign-results.table.column.ariaSharedResultCount')));
      });

      test('it should display shared result count', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          multipleSendings: true,
        });
        const participations = [
          {
            sharedResultCount: 77,
          },
        ];
        this.set('campaign', campaign);
        this.set('participations', participations);

        // when
        const screen = await render(
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
        assert.ok(screen.getByText(t('pages.campaign-results.table.column.sharedResultCount')));
        assert.ok(screen.getByRole('cell', { name: '77' }));
      });
    });

    module('campaign has multiple sending not enabled', function () {
      test('it should display shared result count header', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          multipleSendings: false,
        });

        this.set('campaign', campaign);
        this.set('participations', []);

        // when
        const screen = await render(
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
        assert.notOk(screen.queryByText(t('pages.campaign-results.table.column.sharedResultCount')));
        assert.notOk(screen.queryByLabelText(t('pages.campaign-results.table.column.ariaSharedResultCount')));
      });

      test('it should not display shared result count', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          multipleSendings: false,
        });
        const participations = [
          {
            sharedResultCount: 77,
          },
        ];
        this.set('campaign', campaign);
        this.set('participations', participations);

        // when
        const screen = await render(
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
        assert.notOk(screen.queryByText(t('pages.campaign-results.table.column.sharedResultCount')));
        assert.notOk(screen.queryByRole('cell', { name: '77' }));
      });
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
      const screen = await render(
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
      assert.ok(screen.getByRole('columnheader', { name: 'identifiant externe' }));
      assert.ok(screen.getByRole('cell', { name: '123' }));
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
      const screen = await render(
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
      assert.ok(screen.getByText('Aucune participation'));
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
      const screen = await render(
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
      assert.notOk(screen.queryByRole('columnheader', { name: 'Résultats Thématiques' }));
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
      const screen = await render(
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
      assert.ok(screen.getByRole('columnheader', { name: 'Résultats Thématiques' }));
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

      const participations = [{ masteryRate: 0.6, isShared: true, reachedStage: 2, totalStage: 2 }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      const screen = await render(
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

      // for those who can see the stars but need more information for comprehension
      assert.ok(screen.getByText(t('common.result.stages', { count: 1, total: 1 })));

      // for those who can't see the stars
      assert.ok(
        screen.getByRole('cell', {
          name: t('common.result.accessibility-description', {
            percentage: 0.6,
            stage: 1,
            totalStage: 1,
          }),
        }),
      );
    });
  });
});
