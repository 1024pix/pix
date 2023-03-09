import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | import-candidates', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders texts about Feuille émargement', async function (assert) {
    // given
    const certificationCandidate = EmberObject.create({
      firstName: 'Julie',
      lastName: 'Abba',
    });
    this.set('session', {
      certificationCandidates: [certificationCandidate],
    });
    this.set('importAllowed', true);

    // when
    await render(hbs`<ImportCandidates
      @session={{this.session}}
      @importAllowed={{this.importAllowed}}
      />`);

    // then
    assert.contains('Télécharger le modèle de liste des candidats');
    assert.contains('Importer la liste des candidats');
  });
});
