import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import config from 'pix-certif/config/environment';

module('Integration | Component | session-finalization-formbuilder-link-step', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    const formBuilderLinkUrl = config.formBuilderLinkUrl;

    // when
    await render(hbs`<SessionFinalizationFormbuilderLinkStep/>`);

    // then
    assert.contains('Cette étape, facultative, vous permet de nous transmettre tout document que vous jugerez utile de nous communiquer pour le traitement des sessions (capture d\'écran d\'un problème technique, PV de fraude...). Pour cela, suivez ce lien');
    assert.contains('Il n\'est plus obligatoire de nous transmettre la feuille d\'émargement et le PV d\'incident scannés. En revanche, ces deux documents doivent être conservés par votre établissement pendant une durée de 2 ans et pouvoir être fournis à Pix en cas de besoin.');
    assert.equal(this.element.querySelector('a').getAttribute('href'), formBuilderLinkUrl);
  });
});
