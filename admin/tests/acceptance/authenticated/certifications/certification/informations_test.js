import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import clickByLabel from '../../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Acceptance | Route | routes/authenticated/certifications/certification | informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certification;

  hooks.beforeEach(async function () {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
    this.server.create('user', { id: 888 });

    this.server.create('country', {
      code: '99217',
      name: 'JAPON',
    });

    this.server.create('country', {
      code: '99430',
      name: 'GROENLAND',
    });

    certification = this.server.create('certification', {
      id: 123,
      firstName: 'Bora Horza',
      lastName: 'Gobuchul',
      birthdate: '1987-07-24',
      birthplace: 'Sorpen',
      userId: 888,
      sex: 'M',
      birthCountry: 'JAPON',
      birthInseeCode: '99217',
      birthPostalCode: null,
      competencesWithMark: [],
      listChallengesAndAnswers: [],
      createdAt: new Date('2020-01-01'),
      cleaCertificationStatus: 'not_taken',
      pixPlusDroitMaitreCertificationStatus: 'not_taken',
      pixPlusDroitExpertCertificationStatus: 'not_taken',
      pixPlusEduAutonomeCertificationStatus: 'not_taken',
      pixPlusEduAvanceCertificationStatus: 'not_taken',
      pixPlusEduExpertCertificationStatus: 'not_taken',
      pixPlusEduFormateurCertificationStatus: 'not_taken',
    });
  });

  test('it displays candidate information', async function (assert) {
    // when
    await visit(`/certifications/${certification.id}`);

    // then
    assert.contains('Prénom : Bora Horza');
    assert.contains('Nom de famille : Gobuchul');
    assert.contains('Date de naissance : 24/07/1987');
    assert.contains('Sexe : M');
    assert.contains('Commune de naissance : Sorpen');
    assert.contains('Code INSEE de naissance : 99217');
    assert.contains('Code postal de naissance : ');
    assert.contains('Pays de naissance : JAPON');
    assert.contains('Certification CléA numérique : Non passée');
    assert.contains('Certification Pix+ Droit Maître : Non passée');
    assert.contains('Certification Pix+ Droit Expert : Non passée');
    assert.contains('Certification Pix+ Édu Autonome : Non passée');
    assert.contains('Certification Pix+ Édu Avancé : Non passée');
    assert.contains('Certification Pix+ Édu Expert : Non passée');
    assert.contains('Certification Pix+ Édu Formateur : Non passée');
  });

  module('Candidate information edition', function () {
    module('when candidate certification was enrolled before the CPF feature was enabled', function () {
      test('should prevent user from editing candidate information', async function (assert) {
        // given
        this.server.create('certification', {
          id: 456,
          firstName: 'Bora Horza',
          lastName: 'Gobuchul',
          birthdate: '1987-07-24',
          birthplace: 'Sorpen',
          userId: 888,
          sex: null,
          birthCountry: null,
          birthInseeCode: null,
          birthPostalCode: null,
          competencesWithMark: [],
          listChallengesAndAnswers: [],
          createdAt: new Date('2020-01-01'),
        });

        // when
        await visit('/certifications/456');

        // then
        assert.contains('Voir avec PO/Dev pour modifier les infos candidat.');
        assert.dom('button[aria-label="Modifier les informations du candidat"]').isDisabled();
      });
    });

    module('when candidate certification was enrolled with CPF data', function () {
      module('when editing candidate information succeeds', function () {
        test('should save the candidate information data when modifying them', async function (assert) {
          // given
          await visit('/certifications/123');
          await clickByLabel('Modifier les informations du candidat');

          // when
          await fillInByLabel('* Nom de famille', 'Summers');
          await fillInByLabel('* Commune de naissance', 'Sunnydale');
          await clickByLabel('Enregistrer');

          // then
          assert.contains('Prénom : Bora Horza');
          assert.contains('Nom de famille : Summers');
          assert.contains('Date de naissance : 24/07/1987');
          assert.contains('Sexe : M');
          assert.contains('Commune de naissance : Sunnydale');
          assert.contains('Code INSEE de naissance : 99217');
          assert.contains('Code postal de naissance : ');
          assert.contains('Pays de naissance : JAPON');
        });

        test('should display a success notification', async function (assert) {
          // given
          await visit('/certifications/123');
          await clickByLabel('Modifier les informations du candidat');

          // when
          await fillInByLabel('* Nom de famille', 'Summers');
          await fillInByLabel('* Commune de naissance', 'Sunnydale');
          await clickByLabel('Enregistrer');

          // then
          assert.contains('Les informations du candidat ont bien été enregistrées.');
        });

        test('should close the modal', async function (assert) {
          // given
          await visit('/certifications/123');
          await clickByLabel('Modifier les informations du candidat');

          // when
          await fillInByLabel('* Nom de famille', 'Summers');
          await fillInByLabel('* Commune de naissance', 'Sunnydale');
          await clickByLabel('Enregistrer');

          // then
          assert.notContains('Editer les informations du candidat');
        });
      });

      module('when editing candidate information fails', function () {
        test('should display an error notification', async function (assert) {
          // given
          this.server.patch(
            '/certification-courses/:id',
            () => ({
              errors: [{ detail: "Candidate's first name must not be blank or empty" }],
            }),
            422
          );
          await visit(`/certifications/${certification.id}`);
          await clickByLabel('Modifier les informations du candidat');
          await fillInByLabel('* Nom de famille', 'Summers');

          // when
          await clickByLabel('Enregistrer');

          // then
          assert.contains("Candidate's first name must not be blank or empty");
        });

        test('should leave the modal opened', async function (assert) {
          // given
          this.server.patch(
            '/certification-courses/:id',
            () => ({
              errors: [{ detail: "Candidate's first name must not be blank or empty" }],
            }),
            422
          );
          await visit(`/certifications/${certification.id}`);
          await clickByLabel('Modifier les informations du candidat');
          await fillInByLabel('* Nom de famille', 'Summers');

          // when
          await clickByLabel('Enregistrer');

          // then
          assert.contains('Editer les informations du candidat');
        });

        test('should leave candidate information untouched when aborting the edition', async function (assert) {
          // given
          this.server.patch(
            '/certification-courses/:id',
            () => ({
              errors: [{ detail: "Candidate's first name must not be blank or empty" }],
            }),
            422
          );
          await visit(`/certifications/${certification.id}`);
          await clickByLabel('Modifier les informations du candidat');
          await fillInByLabel('* Nom de famille', 'Summers');
          await clickByLabel('Enregistrer');

          // when
          await clickByLabel('Fermer');

          // then
          assert.contains('Prénom : Bora Horza');
          assert.contains('Nom de famille : Gobuchul');
          assert.contains('Date de naissance : 24/07/1987');
          assert.contains('Sexe : M');
          assert.contains('Commune de naissance : Sorpen');
          assert.contains('Code INSEE de naissance : 99217');
          assert.contains('Code postal de naissance : ');
          assert.contains('Pays de naissance : JAPON');
        });
      });
    });
  });

  module('Certification results edition', function () {
    module('when candidate results edit button is clicked', function () {
      test('it disables candidate informations edit button', async function (assert) {
        // when
        await visit(`/certifications/${certification.id}`);
        await clickByLabel('Modifier les résultats du candidat');

        // then
        assert.dom('[aria-label="Modifier les informations du candidat"]').isDisabled();
      });
    });

    module('when candidate results form cancel button is clicked', function () {
      test('it re-enables candidate informations edit button', async function (assert) {
        // when
        await visit(`/certifications/${certification.id}`);
        await clickByLabel('Modifier les résultats du candidat');
        await clickByLabel('Annuler la modification des résultats du candidat');

        // then
        assert.dom('[aria-label="Modifier les informations du candidat"]').exists().isEnabled();
      });
    });

    module('when candidate results form is submitted', function () {
      test('it also re-enables candidate informations edit button', async function (assert) {
        // when
        await visit(`/certifications/${certification.id}`);
        await clickByLabel('Modifier les résultats du candidat');
        await clickByLabel('Enregistrer les résultats du candidat');
        await clickByLabel('Confirmer');

        // then
        assert.dom('[aria-label="Modifier les informations du candidat"]').exists().isEnabled();
      });
    });
  });

  module('Certification issue reports section', function () {
    test('should not render the "Signalements" section when certification has no issue reports', async function (assert) {
      // given
      certification.update({ certificationIssueReports: [] });

      // when
      await visit('/certifications/123');

      // then
      assert.notContains('Signalements');
    });

    test('should render the "Signalements" section when certification has issue reports', async function (assert) {
      // given
      const certificationIssueReport = this.server.create('certification-issue-report', {
        category: 'OTHER',
        description: 'Un signalement impactant',
        isImpactful: true,
      });
      certification.update({ certificationIssueReports: [certificationIssueReport] });

      // when
      await visit('/certifications/123');

      // then
      assert.contains('Signalements');
    });

    test('should display the issue reports, impactful and non impactful', async function (assert) {
      // given
      const certificationIssueReportNonImpactful = this.server.create('certification-issue-report', {
        category: 'CANDIDATE_INFORMATIONS_CHANGES',
        subcategory: 'EXTRA_TIME_PERCENTAGE',
        description: 'Un signalement pas du tout impactant',
        isImpactful: false,
      });
      const certificationIssueReportImpactful = this.server.create('certification-issue-report', {
        category: 'OTHER',
        description: 'Un signalement super impactant',
        isImpactful: true,
      });
      certification.update({
        certificationIssueReports: [certificationIssueReportImpactful, certificationIssueReportNonImpactful],
      });

      // when
      await visit('/certifications/123');

      // then
      assert.contains('Signalement(s) impactant(s)');
      assert.contains('Un signalement super impactant');
      assert.contains('Signalement(s) non impactant(s)');
      assert.contains('Un signalement pas du tout impactant');
    });

    test('should hide "Signalement(s) non impactant(s)" sub-section when no not impactful issue reports exist', async function (assert) {
      // given
      const certificationIssueReportImpactful = this.server.create('certification-issue-report', {
        category: 'OTHER',
        description: 'Un signalement super impactant',
        isImpactful: true,
      });
      certification.update({ certificationIssueReports: [certificationIssueReportImpactful] });

      // when
      await visit('/certifications/123');

      // then
      assert.contains('Signalement(s) impactant(s)');
      assert.contains('Un signalement super impactant');
      assert.notContains('Signalement(s) non impactant(s)');
    });

    test('should hide "Signalement(s) impactant(s)" sub-section when no impactful issue reports exist', async function (assert) {
      // given
      const certificationIssueReportNonImpactful = this.server.create('certification-issue-report', {
        category: 'CANDIDATE_INFORMATIONS_CHANGES',
        subcategory: 'EXTRA_TIME_PERCENTAGE',
        description: 'Un signalement pas du tout impactant',
        isImpactful: false,
      });
      certification.update({ certificationIssueReports: [certificationIssueReportNonImpactful] });

      // when
      await visit('/certifications/123');

      // then
      assert.contains('Signalement(s) non impactant(s)');
      assert.contains('Un signalement pas du tout impactant');
      assert.notContains('Signalement(s) impactant(s)');
    });

    module('Impactful issue reports resolution', function () {
      test('should display a resolved issue report when resolved', async function (assert) {
        // given
        const certificationIssueReportImpactful = this.server.create('certification-issue-report', {
          category: 'OTHER',
          description: 'Un signalement super impactant',
          isImpactful: true,
          resolvedAt: new Date('2020-01-01'),
        });
        certification.update({ certificationIssueReports: [certificationIssueReportImpactful] });

        // when
        await visit('/certifications/123');

        // then
        assert.dom('.certification-issue-report__resolution-status--resolved').exists();
        assert.dom('.certification-issue-report__resolution-status--unresolved').doesNotExist();
      });

      test('should display a non-resolved issue report when not resolved', async function (assert) {
        // given
        const certificationIssueReportImpactful = this.server.create('certification-issue-report', {
          category: 'OTHER',
          description: 'Un signalement super impactant',
          isImpactful: true,
          resolvedAt: null,
        });
        certification.update({ certificationIssueReports: [certificationIssueReportImpactful] });

        // when
        await visit('/certifications/123');

        // then
        assert.dom('.certification-issue-report__resolution-status--resolved').doesNotExist();
        assert.dom('.certification-issue-report__resolution-status--unresolved').exists();
      });
    });

    module('IN_CHALLENGE issue report', function () {
      test('should display a "in challenge" issue report with its challenge number', async function (assert) {
        // given
        const certificationIssueReport = this.server.create('certification-issue-report', {
          category: 'IN_CHALLENGE',
          subcategory: 'IMAGE_NOT_DISPLAYING',
          description: 'image disparue',
          questionNumber: 666,
          isImpactful: true,
        });
        certification.update({ certificationIssueReports: [certificationIssueReport] });

        // when
        await visit('/certifications/123');

        // then
        assert.contains('Problème technique sur une question');
        assert.contains("L'image ne s'affiche pas");
        assert.contains('image disparue');
        assert.contains('Question 666');
      });
    });
  });

  module('when go to user detail button is clicked', function () {
    test('it should redirect to user detail page', async function (assert) {
      // given
      await visit(`/certifications/${certification.id}`);

      // when
      await clickByLabel("Voir les détails de l'utilisateur");

      // then
      assert.equal(currentURL(), '/users/888');
    });
  });

  module('Certification cancellation', function () {
    module('Cancel', function (hooks) {
      hooks.beforeEach(async function () {
        certification.update({ status: 'validated' });
      });

      test('should display confirmation popup for cancellation when certification is not yet cancelled and cancellation button is clicked', async function (assert) {
        // given
        await visit(`/certifications/${certification.id}`);

        // when
        await clickByLabel('Annuler la certification');

        // then
        assert.contains(
          'Êtes-vous sûr·e de vouloir annuler cette certification ? Cliquez sur confirmer pour poursuivre.'
        );
      });

      test('should not cancel the certification when aborting action in the confirmation popup', async function (assert) {
        // given
        await visit(`/certifications/${certification.id}`);
        await clickByLabel('Annuler la certification');

        // when
        await clickByLabel('Close');

        // then
        assert.contains('Validée');
        assert.contains('Annuler la certification');
      });

      test('should cancel the certification when confirming action in the confirmation popup', async function (assert) {
        // given
        await visit(`/certifications/${certification.id}`);
        await clickByLabel('Annuler la certification');

        // when
        await clickByLabel('Confirmer');

        // then
        assert.contains('Annulée');
        assert.contains('Désannuler la certification');
      });
    });

    module('Uncancel', function (hooks) {
      hooks.beforeEach(async function () {
        certification.update({ status: 'cancelled' });
      });

      test('should display confirmation popup for uncancellation when certification is cancelled and uncancellation button is clicked', async function (assert) {
        // given
        await visit(`/certifications/${certification.id}`);

        // when
        await clickByLabel('Désannuler la certification');

        // then
        assert.contains(
          'Êtes-vous sûr·e de vouloir désannuler cette certification ? Cliquez sur confirmer pour poursuivre.'
        );
      });

      test('should not uncancel the certification when aborting action in the confirmation popup', async function (assert) {
        // given
        await visit(`/certifications/${certification.id}`);
        await clickByLabel('Désannuler la certification');

        // when
        await clickByLabel('Close');

        // then
        assert.contains('Annulée');
        assert.contains('Désannuler la certification');
      });

      test('should uncancel the certification when confirming action in the confirmation popup', async function (assert) {
        // given
        await visit(`/certifications/${certification.id}`);
        await clickByLabel('Désannuler la certification');

        // when
        await clickByLabel('Confirmer');

        // then
        assert.contains('Validée');
        assert.contains('Annuler la certification');
      });
    });
  });
});
