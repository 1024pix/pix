import { render } from '@1024pix/ember-testing-library';
import Insights from 'pix-admin/components/target-profiles/insights';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | Insights', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('section rendering', function () {
    const targetProfile = {
      badges: [],
      stages: [],
    };

    test('it should display the badges title and an empty list', async function (assert) {
      // given
      const stageCollection = { stages: [] };

      // when
      const screen = await render(
        <template><Insights @targetProfile={{targetProfile}} @stageCollection={{stageCollection}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Badges')).exists();
      assert.dom(screen.getByText('Aucun badge associé')).exists();
    });

    test('it should display the stages title and an empty list', async function (assert) {
      // given
      const stageCollection = { stages: [] };

      // when
      const screen = await render(
        <template><Insights @targetProfile={{targetProfile}} @stageCollection={{stageCollection}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Paliers')).exists();
      assert.dom(screen.getByText('Aucun palier associé')).exists();
    });
  });
});
