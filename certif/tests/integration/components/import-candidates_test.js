import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | import-candidates', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders texts about Feuille émargement', async function(assert) {
    // given
    const certificationCandidate = EmberObject.create({
      firstName: 'Julie',
      lastName: 'Abba',
    });
    this.set('session', {
      certificationCandidates: [
        certificationCandidate,
      ],
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
