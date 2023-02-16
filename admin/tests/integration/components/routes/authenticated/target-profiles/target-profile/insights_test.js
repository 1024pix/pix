import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | Insights', function (hooks) {
  setupRenderingTest(hooks);

  module('section rendering', function (hooks) {
    let model;
    hooks.beforeEach(() => {
      model = {
        badges: [],
        stages: [],
      };
    });

    test('it should display the badges title and an empty list', async function (assert) {
      // given
      this.set('model', model);

      // when
      const screen = await render(hbs`<TargetProfiles::Insights @targetProfile={{this.model}} />`);

      // then
      assert.dom(screen.getByText('Résultats thématiques')).exists();
      assert.dom(screen.getByText('Aucun résultat thématique associé')).exists();
    });

    test('it should display the stages title and an empty list', async function (assert) {
      // given
      this.set('model', model);

      // when
      const screen = await render(hbs`<TargetProfiles::Insights @targetProfile={{this.model}} />`);

      // then
      assert.dom(screen.getByText('Paliers')).exists();
      assert.dom(screen.getByText('Aucun palier associé')).exists();
    });
  });
});
