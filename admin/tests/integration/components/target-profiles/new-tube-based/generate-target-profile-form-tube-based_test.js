import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { A as EmberArray } from '@ember/array';

module('Integration | Component | targetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased', function (hooks) {
  setupRenderingTest(hooks);
  let frameworks;

  hooks.beforeEach(() => {
    frameworks = [{ id: 'frameworkId', name: 'Pix', areas: EmberArray() }];
  });

  test('it should display a return button', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'Retour' })).exists();
  });

  test('it should display a download target profile button', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );

    // then
    assert.dom(screen.getByRole('link', { name: 'Télécharger la sélection des sujets (JSON)' })).exists();
  });
});
