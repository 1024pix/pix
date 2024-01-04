import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | Import::FileImportBlock', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the file import block', async function (assert) {
    // given
    this.set('preImportSessions', () => {});
    this.set('file', null);
    this.set('fileName', null);
    this.set('removeImport', () => {});

    // when
    const screen = await render(
      hbs`<Import::FileImportBlock
        @preImportSessions={{this.preImportSessions}}
        @file={{this.file}}
        @fileName={{this.fileName}}
        @removeImport={{this.removeImport}}
        @buttonLabel="Importer (.csv)"
      />`,
    );

    // then
    assert.dom(screen.getByText('Importer le modèle complété')).exists();
    assert.dom(screen.getByRole('button', { name: 'Importer (.csv)' })).exists();
    assert
      .dom(screen.getByText('Sélectionnez le modèle préalablement rempli. Seul un fichier .csv pourra être importé.'))
      .exists();
  });
});
