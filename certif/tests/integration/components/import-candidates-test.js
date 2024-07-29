import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | import-candidates', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders texts about sco import candidates', async function (assert) {
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
    const screen = await render(
      hbs`<ImportCandidates @session={{this.session}} @importAllowed={{this.importAllowed}} />`,
    );

    // then
    assert.dom(screen.getByText('Télécharger le modèle de liste des candidats')).exists();
    assert.dom(screen.getByText('Importer la liste des candidats')).exists();
  });
});
