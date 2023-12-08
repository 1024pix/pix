import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import { render, getByTextWithHtml } from '@1024pix/ember-testing-library';

module('Integration | Component | Import::StepOneSection', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the step one section', async function (assert) {
    // given
    this.set('downloadSessionImportTemplate', () => {});
    this.set('preImportSessions', () => {});
    this.set('file', null);
    this.set('fileName', () => null);
    this.set('removeImport', () => {});
    this.set('validateSessions', () => {});
    this.set('isImportDisabled', true);

    // when
    const { getByText, getByRole } = await render(
      hbs`<Import::StepOneSection
        @downloadSessionImportTemplate={{this.downloadSessionImportTemplate}}
        @preImportSessions={{this.preImportSessions}}
        @file={{this.file}}
        @fileName={{this.fileName}}
        @removeImport={{this.removeImport}}
        @validateSessions={{this.validateSessions}}
        @isImportDisabled={{this.isImportDisabled}}
      />`,
    );

    // then
    assert.dom(getByRole('heading', { name: 'Import du modèle', level: 2 })).exists();
    assert.dom(getByText('Vous pouvez créer des sessions :')).exists();
    assert.ok(getByTextWithHtml('<strong>Avec candidats</strong>, complétez le modèle dans son intégralité,'));
    assert.ok(getByTextWithHtml('<strong>Sans candidat</strong>, complétez uniquement les informations des sessions.'));
    assert.ok(getByTextWithHtml('<strong>Pour remplacer</strong> une liste pré-existante dans le fichier modèle,'));
    assert.ok(getByTextWithHtml('<strong>Pour inscrire</strong> des candidats dans une session vide.'));
    assert
      .dom(
        getByText(
          'Attention à renseigner le numéro de session sans les autres informations de sessions (ex: date, heure, etc.) pour éviter les doublons lors de la création.',
        ),
      )
      .exists();
    assert.dom(getByText('Télécharger le modèle vierge')).exists();
    assert
      .dom(
        getByRole('button', {
          name: 'Télécharger le modèle vierge',
        }),
      )
      .exists();
    assert.dom(getByText('Importer le modèle complété')).exists();
    assert.dom(getByText('Importer (.csv)')).exists();
  });
});
