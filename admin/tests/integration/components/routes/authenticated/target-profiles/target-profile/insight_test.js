import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | insight', function(hooks) {

  setupRenderingTest(hooks);

  module('section rendering', function(hooks) {
    let model;
    hooks.beforeEach(() => {
      model = {
        badges: [],
        stages: [],
      };
    });

    test('it should display the badges title and an empty list', async function(assert) {
      // given
      this.set('model', model);

      // when
      await render(hbs`<TargetProfiles::Insight @model={{this.model}}/>`);

      // then
      assert.contains('Résultats thématiques');
      assert.contains('Aucun résultat thématique associé');
    });

    test('it should display the stages title and an empty list', async function(assert) {
      // given
      this.set('model', model);

      // when
      await render(hbs`<TargetProfiles::Insight @model={{this.model}}/>`);

      // then
      assert.contains('Paliers');
      assert.contains('Aucun palier associé');
    });
  });
});
