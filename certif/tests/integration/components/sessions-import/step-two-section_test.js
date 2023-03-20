import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';

module('Integration | Component | Import::StepTwoSection', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the count of sessions and candidates', async function (assert) {
    // given
    this.set('sessionsCount', 2);
    this.set('sessionsWithoutCandidatesCount', 0);
    this.set('candidatesCount', 12);
    this.set('errorReports', []);

    // when
    const { getByText } = await render(
      hbs`<Import::StepTwoSection @sessionsCount={{this.sessionsCount}} @sessionsWithoutCandidatesCount={{this.sessionsWithoutCandidatesCount}}  @candidatesCount={{this.candidatesCount}} @errorReports={{this.errorReports}}/>`
    );

    // then
    assert.dom(getByText('2 sessions dont 0 session sans candidat')).exists();
    assert.dom(getByText('12 candidats')).exists();
  });

  module('when the imported file contains errors', function () {
    [
      { error: 'CANDIDATE_FIRST_NAME_REQUIRED', expectedMessage: 'Champ obligatoire "Prénom" manquant' },
      { error: 'CANDIDATE_LAST_NAME_REQUIRED', expectedMessage: 'Champ obligatoire "Nom de famille" manquant' },
      { error: 'CANDIDATE_SEX_REQUIRED', expectedMessage: 'Champ obligatoire "Sexe" manquant' },
      { error: 'CANDIDATE_SEX_NOT_VALID', expectedMessage: 'Champ sexe format incorrect, format accepté "M"/"F"' },
      {
        error: 'CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_EXCLUSIVE',
        expectedMessage: 'Renseigner soit un code INSEE soit un code postal et un nom de commune de naissance.',
      },
      {
        error: 'CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED',
        expectedMessage: 'Champ obligatoire "Code postal" OU "Code INSEE" manquant',
      },
      { error: 'CANDIDATE_BIRTH_COUNTRY_REQUIRED', expectedMessage: 'Champ obligatoire "Pays de naissance" manquant' },
      { error: 'CANDIDATE_BIRTH_COUNTRY_NOT_FOUND', expectedMessage: 'Pays de naissance non trouvé' },
      { error: 'CANDIDATE_BIRTHDATE_REQUIRED', expectedMessage: 'Champ obligatoire "Date de naissance" manquant' },
      {
        error: 'CANDIDATE_BIRTHDATE_FORMAT_INCORRECT',
        expectedMessage: 'Format de date incorrect, champ "Date de naissance", format accepté JJ/MM/AAAA',
      },
      { error: 'CANDIDATE_EXTRA_TIME_BELOW_ONE', expectedMessage: 'Format temps majoré incorrect, format accepté XX%' },
      { error: 'CANDIDATE_EXTRA_TIME_INTEGER', expectedMessage: 'Format temps majoré incorrect, format accepté XX%' },
      {
        error: 'CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION',
        expectedMessage: "Inscription possible qu'à une seule certification complémentaire par candidat.",
      },
      {
        error: 'CANDIDATE_BILLING_MODE_REQUIRED',
        expectedMessage: 'Champ obligatoire "Tarification par Pix" manquant',
      },
      {
        error: 'CANDIDATE_BILLING_MODE_NOT_VALID',
        expectedMessage:
          'Format tarification part Pix incorrect, formats acceptés "Gratuite", "Payante" ou "Prépayée".',
      },
      {
        error: 'CANDIDATE_PREPAYMENT_CODE_REQUIRED',
        expectedMessage:
          'Champ obligatoire "Code de prépaiement" manquant, doit être renseigné en cas de "Tarification par Pix" "Prépayée"',
      },
      {
        error: 'CANDIDATE_PREPAYMENT_CODE_MUST_BE_EMPTY',
        expectedMessage: 'Champ "Code de prépaiement" doit rester vide',
      },
      {
        error: 'CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION',
        expectedMessage: 'Edition des candidats impossible, N° de session correspond à une session déjà démarrée',
      },
      {
        error: 'DUPLICATE_CANDIDATE_NOT_ALLOWED_IN_SESSION',
        expectedMessage: 'Candidat inscrit plusieurs fois à cette session',
      },
      { error: 'SESSION_ADDRESS_REQUIRED', expectedMessage: 'Champ obligatoire "Nom du site" manquant' },
      { error: 'SESSION_ROOM_REQUIRED', expectedMessage: 'Champ obligatoire "Nom de la salle" manquant' },
      { error: 'SESSION_DATE_REQUIRED', expectedMessage: 'Champ obligatoire "Date de session" manquant' },
      {
        error: 'SESSION_DATE_NOT_VALID',
        expectedMessage: 'Format de date incorrect, champ "Date de session", format accepté JJ/MM/AAAA',
      },
      { error: 'SESSION_TIME_REQUIRED', expectedMessage: 'Champ obligatoire "Heure de début" manquant' },
      {
        error: 'SESSION_TIME_NOT_VALID',
        expectedMessage: 'Format d\'heure incorrect, champ "Heure de début", format accepté HH:MM',
      },
      { error: 'SESSION_EXAMINER_REQUIRED', expectedMessage: 'Champ obligatoire "Surveillant(s)" manquant' },
      {
        error: 'SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS',
        expectedMessage:
          'Session déjà créée avec ces critères, pour ajouter des candidats n’indiquer que le N°, pas les informations de session.',
      },
      {
        error: 'SESSION_SCHEDULED_IN_THE_PAST',
        expectedMessage: 'Date et/ou heure indiquées antérieures à la date du jour.',
      },
      {
        error: 'INFORMATION_NOT_ALLOWED_WITH_SESSION_ID',
        expectedMessage: 'Numéro de session fourni, veuillez supprimer les informations de session associées.',
      },
    ].forEach(function ({ error, expectedMessage }) {
      test('it renders a report', async function (assert) {
        // given
        this.set('errorReports', [{ line: '5', code: error, blocking: true }]);

        // when
        const { getByText, getByRole } = await render(hbs`<Import::StepTwoSection
          @errorReports={{this.errorReports}}
          />`);

        await click(getByRole('button', { name: '1 erreur bloquante' }));

        // then
        assert.dom(getByText(`Ligne 5 : ${expectedMessage}`)).exists();
      });
    });

    test('it renders a button to return to step one', async function (assert) {
      // given
      this.set('errorReports', [
        { line: 1, code: 'CANDIDATE_FIRST_NAME_REQUIRED', blocking: true },
        { line: 2, code: 'EMPTY_SESSION', blocking: false },
      ]);

      // when
      const { getByRole } = await render(hbs`<Import::StepTwoSection @errorReports={{this.errorReports}} />`);

      // then
      assert
        .dom(getByRole('button', { name: "Revenir à l'étape précédente pour importer le fichier à nouveau" }))
        .exists();
    });
  });

  module('when the imported file contains non blocking errors', function () {
    [{ error: 'EMPTY_SESSION', expectedMessage: 'La session ne contient pas de candidat.' }].forEach(function ({
      error,
      expectedMessage,
    }) {
      test('it renders a report', async function (assert) {
        // given
        this.set('errorReports', [{ line: '5', code: error, blocking: false }]);

        // when
        const { getByText, getByRole } = await render(
          hbs`<Import::StepTwoSection @errorReports={{this.errorReports}}/>`
        );

        await click(getByRole('button', { name: '1 point d’attention non bloquant' }));

        // then
        assert.dom(getByText(`Ligne 5 : ${expectedMessage}`)).exists();
      });
    });

    test('it renders a button to return to step one', async function (assert) {
      // given
      this.set('errorReports', [{ line: 2, code: 'EMPTY_SESSION', blocking: false }]);

      // when
      const { getByRole } = await render(hbs`<Import::StepTwoSection @errorReports={{this.errorReports}} />`);

      // then
      assert
        .dom(getByRole('button', { name: "Revenir à l'étape précédente pour importer le fichier à nouveau" }))
        .exists();
    });

    test('it renders a button to create the sessions', async function (assert) {
      // given
      this.set('errorReports', [{ line: 2, code: 'EMPTY_SESSION', blocking: false }]);

      // when
      const { getByRole } = await render(hbs`<Import::StepTwoSection @errorReports={{this.errorReports}} />`);

      // then
      assert.dom(getByRole('button', { name: 'Finaliser quand même la création/édition' })).exists();
    });
  });

  module('when the imported file contains no errors', function () {
    test('it renders a button to create the sessions', async function (assert) {
      // given
      this.set('errorReports', []);

      // when
      const { getByRole } = await render(hbs`<Import::StepTwoSection @errorReports={{this.errorReports}} />`);

      // then
      assert.dom(getByRole('button', { name: 'Finaliser la création/édition' })).exists();
    });
  });
});
