import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import { render, within, getByTextWithHtml } from '@1024pix/ember-testing-library';

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

    const createSessionsFirstList = getByRole('list', { name: 'Vous pouvez créer des sessions :' });
    const createSessionsSecondList = getByRole('list', {
      name: 'Pour éditer la liste des candidats de sessions déjà créées ?',
    });
    const firstListItems = within(createSessionsFirstList).getAllByRole('listitem');
    const secondListItems = within(createSessionsSecondList).getAllByRole('listitem');
    assert.strictEqual(firstListItems[0].textContent, 'Avec candidats, complétez le modèle dans son intégralité,');
    assert.strictEqual(
      firstListItems[1].textContent,
      'Sans candidat, complétez uniquement les informations des sessions.',
    );
    assert.strictEqual(
      secondListItems[0].textContent,
      'Pour remplacer une liste pré-existante dans le fichier modèle,',
    );
    assert.strictEqual(secondListItems[1].textContent, 'Pour inscrire des candidats dans une session vide.');

    assert
      .dom(getByText('Sélectionnez le modèle préalablement rempli. Seul un fichier .csv pourra être importé.'))
      .exists();
    assert
      .dom(getByText('Sélectionnez le modèle préalablement rempli. Seul un fichier .csv pourra être importé.'))
      .exists();
    assert.ok(
      getByTextWithHtml(
        'Attention à ne modifier ni les noms des colonnes ni leur ordre afin de ne pas altérer le modèle. <br> Vous pouvez ouvrir le fichier .csv téléchargé soit dans un logiciel tableur soit dans un éditeur de code (valeurs séparées par des points virgules).',
      ),
    );
  });
});
