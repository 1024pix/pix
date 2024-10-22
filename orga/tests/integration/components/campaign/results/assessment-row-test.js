import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::AssessmentRow', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;
  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.set('noop', sinon.stub());
  });

  module('when the campaign has multiple sending enabled', function () {
    test('it should display shared result count', async function (assert) {
      // given
      const participation = { sharedResultCount: 10 };

      this.set('displayParticipationCount', true);
      this.set('campaign', {});
      this.set('participation', participation);

      // when
      const screen = await render(
        hbs`<Campaign::Results::AssessmentRow
  @hasStages={{this.campaign.hasStages}}
  @hasBadges={{this.campaign.hasBadges}}
  @hasExternalId={{this.campaign.hasExternalId}}
  @participation={{this.participation}}
  @campaignId={{this.campaign.id}}
  @stages={{this.campaign.stages}}
  @onClickParticipant={{this.noop}}
  @displayParticipationCount={{this.displayParticipationCount}}
/>`,
      );
      // then
      assert.ok(screen.getByText('10'));
    });

    module('evolution icons', function (hooks) {
      let campaign;
      hooks.beforeEach(function () {
        campaign = store.createRecord('campaign', {
          id: '1',
          name: 'campagne 1',
          participationsCount: 1,
          multipleSendings: true,
        });
      });

      test('it should display trendingUp icon when participant evolution is increase', async function (assert) {
        // given
        const participations = [
          {
            firstName: 'John',
            lastName: 'Doe',
            masteryRate: 0.5,
            evolution: 'increase',
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
/>`,
        );

        // then
        assert.ok(screen.getByRole('cell', { name: t('pages.campaign-results.table.evolution.increase') }));
      });

      test('it should display trendingDown icon when participant evolution is decrease', async function (assert) {
        // given
        const participations = [
          {
            firstName: 'John',
            lastName: 'Doe',
            masteryRate: 0.5,
            evolution: 'decrease',
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
/>`,
        );

        // then
        assert.ok(screen.getByRole('cell', { name: t('pages.campaign-results.table.evolution.decrease') }));
      });

      test('it should display trendingFlat icon when participant evolution is stable', async function (assert) {
        // given
        const participations = [
          {
            firstName: 'John',
            lastName: 'Doe',
            masteryRate: 0.5,
            evolution: 'stable',
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
/>`,
        );

        // then
        assert.ok(screen.getByRole('cell', { name: t('pages.campaign-results.table.evolution.stable') }));
      });

      test('it should display empty cell when participant evolution is null', async function (assert) {
        // given
        const participations = [
          {
            firstName: 'John',
            lastName: 'Doe',
            masteryRate: 0.5,
            evolution: null,
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
/>`,
        );

        // then
        assert.ok(screen.getByRole('cell', { name: t('pages.campaign-results.table.evolution.unavailable') }));
      });
    });
  });

  module('when the campaign has multiple sending not enabled', function () {
    test('it should not display shared result count', async function (assert) {
      // given
      const participation = { sharedResultCount: 10 };

      this.set('displayParticipationCount', false);
      this.set('campaign', {});
      this.set('participation', participation);

      // when
      const screen = await render(
        hbs`<Campaign::Results::AssessmentRow
  @hasStages={{this.campaign.hasStages}}
  @hasBadges={{this.campaign.hasBadges}}
  @hasExternalId={{this.campaign.hasExternalId}}
  @participation={{this.participation}}
  @campaignId={{this.campaign.id}}
  @stages={{this.campaign.stages}}
  @onClickParticipant={{this.noop}}
  @displayParticipationCount={{this.displayParticipationCount}}
/>`,
      );
      // then
      assert.notOk(screen.queryByText('10'));
    });
  });
});
