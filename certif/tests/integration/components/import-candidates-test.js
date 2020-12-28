import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | import-candidates', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders old texts about PV session when isReportsCategorizationFeatureToggleEnabled is false', async function(assert) {
    // given
    this.set('session', {
      certificationCandidates: [],
    });
    this.set('isReportsCategorizationFeatureToggleEnabled', false);
    this.set('importAllowed', true);

    // when
    await render(hbs`<ImportCandidates
      @session={{this.session}}
      @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
      @importAllowed={{this.importAllowed}}
      />`);

    // then
    assert.contains('Télécharger le PV de session');
    assert.contains('Importer le PV de session');
  });

  test('it renders new texts about Feuille émargement when isReportsCategorizationFeatureToggleEnabled is true', async function(assert) {
    // given
    this.set('session', {
      certificationCandidates: [],
    });
    this.set('isReportsCategorizationFeatureToggleEnabled', true);
    this.set('importAllowed', true);

    // when
    await render(hbs`<ImportCandidates
      @session={{this.session}}
      @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
      @importAllowed={{this.importAllowed}}
      />`);

    // then
    assert.contains('Télécharger la feuille d\'émargement');
    assert.contains('Importer la feuille d\'émargement');
  });
});
