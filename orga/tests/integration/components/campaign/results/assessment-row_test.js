import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Results::AssessmentRow', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
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
