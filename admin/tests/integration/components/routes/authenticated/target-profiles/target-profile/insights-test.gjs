import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import Insights from 'pix-admin/components/target-profiles/insights';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | Insights', function (hooks) {
  setupRenderingTest(hooks);

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
      assert.dom(screen.getByText('Résultats thématiques')).exists();
      assert.dom(screen.getByText('Aucun résultat thématique associé')).exists();
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
