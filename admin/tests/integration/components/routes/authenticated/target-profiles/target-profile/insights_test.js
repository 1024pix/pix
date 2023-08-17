import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | Insights', function (hooks) {
  setupRenderingTest(hooks);

  module('section rendering', function (hooks) {
    let targetProfile;
    hooks.beforeEach(() => {
      targetProfile = {
        badges: [],
        stages: [],
      };
    });

    test('it should display the badges title and an empty list', async function (assert) {
      // given
      this.set('targetProfile', targetProfile);
      this.set('stageCollection', { stages: [] });

      // when
      const screen = await render(
        hbs`<TargetProfiles::Insights @targetProfile={{this.targetProfile}} @stageCollection={{this.stageCollection}}/>`,
      );

      // then
      assert.dom(screen.getByText('Résultats thématiques')).exists();
      assert.dom(screen.getByText('Aucun résultat thématique associé')).exists();
    });

    test('it should display the stages title and an empty list', async function (assert) {
      // given
      this.set('targetProfile', targetProfile);
      this.set('stageCollection', { stages: [] });

      // when
      const screen = await render(
        hbs`<TargetProfiles::Insights @targetProfile={{this.targetProfile}} @stageCollection={{this.stageCollection}} />`,
      );

      // then
      assert.dom(screen.getByText('Paliers')).exists();
      assert.dom(screen.getByText('Aucun palier associé')).exists();
    });
  });
});
