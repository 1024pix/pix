import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import MasteryPercentageDisplay from 'pix-orga/components/ui/mastery-percentage-display';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | mastery-percentage-display', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display mastery rate', async function (assert) {
    //given
    const masteryRate = 0.2;
    const hasStages = false;
    const reachedStage = null;
    const totalStage = null;
    const prescriberTitle = null;
    const prescriberDescription = null;

    // when
    const screen = await render(
      <template>
        <MasteryPercentageDisplay
          @masteryRate={{masteryRate}}
          @hasStages={{hasStages}}
          @reachedStage={{reachedStage}}
          @totalStage={{totalStage}}
          @prescriberTitle={{prescriberTitle}}
          @prescriberDescription={{prescriberDescription}}
          @isTableDisplay={{false}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByText('20 %'));
  });

  module('when has stage', function () {
    test('it should display star', async function (assert) {
      //given
      const masteryRate = 0.2;
      const hasStages = true;
      const reachedStage = 4;
      const totalStages = 5;
      const prescriberTitle = null;
      const prescriberDescription = null;

      // when
      const screen = await render(
        <template>
          <MasteryPercentageDisplay
            @masteryRate={{masteryRate}}
            @hasStages={{hasStages}}
            @reachedStage={{reachedStage}}
            @totalStage={{totalStages}}
            @prescriberTitle={{prescriberTitle}}
            @prescriberDescription={{prescriberDescription}}
            @isTableDisplay={{false}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('common.result.stages', { count: 3, total: 4 })));
    });

    module('tooltip', function () {
      test('available with title', async function (assert) {
        //given
        const masteryRate = 0.2;
        const hasStages = true;
        const reachedStage = 4;
        const totalStages = 5;
        const prescriberTitle = 'my title';
        const prescriberDescription = null;

        // when
        const screen = await render(
          <template>
            <MasteryPercentageDisplay
              @masteryRate={{masteryRate}}
              @hasStages={{hasStages}}
              @reachedStage={{reachedStage}}
              @totalStage={{totalStages}}
              @prescriberTitle={{prescriberTitle}}
              @prescriberDescription={{prescriberDescription}}
              @isTableDisplay={{false}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByText(prescriberTitle));
      });

      test('available with description', async function (assert) {
        //given
        const masteryRate = 0.2;
        const hasStages = true;
        const reachedStage = 4;
        const totalStages = 5;
        const prescriberTitle = null;
        const prescriberDescription = 'my description';

        // when
        const screen = await render(
          <template>
            <MasteryPercentageDisplay
              @masteryRate={{masteryRate}}
              @hasStages={{hasStages}}
              @reachedStage={{reachedStage}}
              @totalStage={{totalStages}}
              @prescriberTitle={{prescriberTitle}}
              @prescriberDescription={{prescriberDescription}}
              @isTableDisplay={{false}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByText(prescriberDescription));
      });
    });
  });
});
