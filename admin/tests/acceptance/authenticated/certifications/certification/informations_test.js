import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

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
      pixPlusEduInitieCertificationStatus: 'not_taken',
      pixPlusEduConfirmeCertificationStatus: 'not_taken',
      pixPlusEduAvanceCertificationStatus: 'not_taken',
      pixPlusEduExpertCertificationStatus: 'not_taken',
    });
  });

  test('it displays candidate information', async function (assert) {
    // when
    const screen = await visitScreen(`/certifications/${certification.id}`);

    // then
    assert.dom(screen.getByText('Prénom : Bora Horza')).exists();
    assert.dom(screen.getByText('Nom de famille : Gobuchul')).exists();
    assert.dom(screen.getByText('Date de naissance : 24/07/1987')).exists();
    assert.dom(screen.getByText('Sexe : M')).exists();
    assert.dom(screen.getByText('Commune de naissance : Sorpen')).exists();
    assert.dom(screen.getByText('Code INSEE de naissance : 99217')).exists();
    assert.dom(screen.getByText('Code postal de naissance :')).exists();
    assert.dom(screen.getByText('Pays de naissance : JAPON')).exists();
  });

  test('it displays validated partner certifications', async function (assert) {
    //given
    certification.update({
      cleaCertificationStatus: 'acquired',
      pixPlusDroitMaitreCertificationStatus: 'acquired',
      pixPlusDroitExpertCertificationStatus: 'acquired',
      pixPlusEduInitieCertificationStatus: 'acquired',
      pixPlusEduConfirmeCertificationStatus: 'acquired',
      pixPlusEduAvanceCertificationStatus: 'acquired',
      pixPlusEduExpertCertificationStatus: 'acquired',
    });

    // when
    const screen = await visitScreen(`/certifications/${certification.id}`);

    // then
    assert.dom(screen.getByText('Certification CléA numérique :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Droit Maître :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Droit Expert :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Initié (entrée dans le métier) :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Confirmé :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Avancé :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Expert :')).exists();
    assert.strictEqual(screen.getAllByText('Validée').length, 7);
  });

  test('it displays rejected partner certifications', async function (assert) {
    // given
    certification.update({
      cleaCertificationStatus: 'rejected',
      pixPlusDroitMaitreCertificationStatus: 'rejected',
      pixPlusDroitExpertCertificationStatus: 'rejected',
      pixPlusEduInitieCertificationStatus: 'rejected',
      pixPlusEduConfirmeCertificationStatus: 'rejected',
      pixPlusEduAvanceCertificationStatus: 'rejected',
      pixPlusEduExpertCertificationStatus: 'rejected',
    });

    // when
    const screen = await visitScreen(`/certifications/${certification.id}`);

    // then
    assert.dom(screen.getByText('Certification CléA numérique :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Droit Maître :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Droit Expert :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Initié (entrée dans le métier) :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Confirmé :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Avancé :')).exists();
    assert.dom(screen.getByText('Certification Pix+ Édu Expert :')).exists();
    assert.strictEqual(screen.getAllByText('Rejetée').length, 7);
  });

  test('it does not display not passed partner certifications', async function (assert) {
    // given
    certification.update({
      cleaCertificationStatus: 'not_taken',
      pixPlusDroitMaitreCertificationStatus: 'not_taken',
      pixPlusDroitExpertCertificationStatus: 'not_taken',
      pixPlusEduInitieCertificationStatus: 'not_taken',
      pixPlusEduConfirmeCertificationStatus: 'not_taken',
      pixPlusEduAvanceCertificationStatus: 'not_taken',
      pixPlusEduExpertCertificationStatus: 'not_taken',
    });

    // when
    const screen = await visitScreen(`/certifications/${certification.id}`);

    // then
    assert.dom(screen.queryByLabelText('Certification CléA numérique :')).doesNotExist();
    assert.dom(screen.queryByLabelText('Certification Pix+ Droit Maître :')).doesNotExist();
    assert.dom(screen.queryByLabelText('Certification Pix+ Droit Expert :')).doesNotExist();
    assert.dom(screen.queryByLabelText('Certification Pix+ Édu Initié (entrée dans le métier) :')).doesNotExist();
    assert.dom(screen.queryByLabelText('Certification Pix+ Édu Confirmé :')).doesNotExist();
    assert.dom(screen.queryByLabelText('Certification Pix+ Édu Avancé :')).doesNotExist();
    assert.dom(screen.queryByLabelText('Certification Pix+ Édu Expert :')).doesNotExist();
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
        const screen = await visitScreen('/certifications/456');

        // then
        assert.dom(screen.getByText('Voir avec PO/Dev pour modifier les infos candidat.')).exists();
        assert.dom('button[aria-label="Modifier les informations du candidat"]').isDisabled();
      });
    });

    module('when candidate certification was enrolled with CPF data', function () {
      module('when editing candidate information succeeds', function () {
        test('should save the candidate information data when modifying them', async function (assert) {
          // given
          const screen = await visitScreen('/certifications/123');
          await clickByName('Modifier les informations du candidat');

          // when
          await fillByLabel('* Nom de famille', 'Summers');
          await fillByLabel('* Commune de naissance', 'Sunnydale');
          await clickByName('Enregistrer');

          // then
          assert.dom(screen.getByText('Prénom : Bora Horza')).exists();
          assert.dom(screen.getByText('Nom de famille : Summers')).exists();
          assert.dom(screen.getByText('Date de naissance : 24/07/1987')).exists();
          assert.dom(screen.getByText('Sexe : M')).exists();
          assert.dom(screen.getByText('Commune de naissance : Sunnydale')).exists();
          assert.dom(screen.getByText('Code INSEE de naissance : 99217')).exists();
          assert.dom(screen.getByText('Code postal de naissance :')).exists();
          assert.dom(screen.getByText('Pays de naissance : JAPON')).exists();
        });

        test('should display a success notification', async function (assert) {
          // given
          const screen = await visitScreen('/certifications/123');
          await clickByName('Modifier les informations du candidat');

          // when
          await fillByLabel('* Nom de famille', 'Summers');
          await fillByLabel('* Commune de naissance', 'Sunnydale');
          await clickByName('Enregistrer');

          // then
          assert.dom(screen.getByText('Les informations du candidat ont bien été enregistrées.')).exists();
        });

        test('should close the modal', async function (assert) {
          // given
          const screen = await visitScreen('/certifications/123');
          await clickByName('Modifier les informations du candidat');

          // when
          await fillByLabel('* Nom de famille', 'Summers');
          await fillByLabel('* Commune de naissance', 'Sunnydale');
          await clickByName('Enregistrer');

          // then
          assert.dom(screen.queryByText('Editer les informations du candidat')).doesNotExist();
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
          const screen = await visitScreen(`/certifications/${certification.id}`);
          await clickByName('Modifier les informations du candidat');
          await fillByLabel('* Nom de famille', 'Summers');

          // when
          await clickByName('Enregistrer');

          // then
          assert.dom(screen.getByText("Candidate's first name must not be blank or empty")).exists();
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
          const screen = await visitScreen(`/certifications/${certification.id}`);
          await clickByName('Modifier les informations du candidat');
          await fillByLabel('* Nom de famille', 'Summers');

          // when
          await clickByName('Enregistrer');

          // then
          assert.dom(screen.getByText('Editer les informations du candidat')).exists();
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
          const screen = await visitScreen(`/certifications/${certification.id}`);
          await clickByName('Modifier les informations du candidat');
          await fillByLabel('* Nom de famille', 'Summers');
          await clickByName('Enregistrer');

          // when
          await clickByName('Fermer');

          // then
          assert.dom(screen.getByText('Prénom : Bora Horza')).exists();
          assert.dom(screen.getByText('Nom de famille : Gobuchul')).exists();
          assert.dom(screen.getByText('Date de naissance : 24/07/1987')).exists();
          assert.dom(screen.getByText('Sexe : M')).exists();
          assert.dom(screen.getByText('Commune de naissance : Sorpen')).exists();
          assert.dom(screen.getByText('Code INSEE de naissance : 99217')).exists();
          assert.dom(screen.getByText('Code postal de naissance :')).exists();
          assert.dom(screen.getByText('Pays de naissance : JAPON')).exists();
        });
      });
    });
  });

  module('Certification results edition', function () {
    module('when candidate results edit button is clicked', function () {
      test('it disables candidate informations edit button', async function (assert) {
        // when
        await visit(`/certifications/${certification.id}`);
        await clickByName('Modifier les résultats du candidat');

        // then
        assert.dom('[aria-label="Modifier les informations du candidat"]').isDisabled();
      });
    });

    module('when candidate results form cancel button is clicked', function () {
      test('it re-enables candidate informations edit button', async function (assert) {
        // when
        await visit(`/certifications/${certification.id}`);
        await clickByName('Modifier les résultats du candidat');
        await clickByName('Annuler la modification des résultats du candidat');

        // then
        assert.dom('[aria-label="Modifier les informations du candidat"]').exists().isEnabled();
      });
    });

    module('when candidate results form is submitted', function () {
      test('it also re-enables candidate informations edit button', async function (assert) {
        // when
        await visit(`/certifications/${certification.id}`);
        await clickByName('Modifier les résultats du candidat');
        await clickByName('Enregistrer les résultats du candidat');
        await clickByName('Confirmer');

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
      const screen = await visitScreen('/certifications/123');

      // then
      assert.dom(screen.queryByText('Signalements')).doesNotExist();
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
      const screen = await visitScreen('/certifications/123');

      // then
      assert.dom(screen.getByText('Signalements')).exists();
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
      const screen = await visitScreen('/certifications/123');

      // then
      assert.dom(screen.getByText('1 Signalement(s) impactant(s)')).exists();
      assert
        .dom(
          screen.getByText(
            'Autre (si aucune des catégories ci-dessus ne correspond au signalement) - Un signalement super impactant'
          )
        )
        .exists();
      assert.dom(screen.getByText('1 Signalement(s) non impactant(s)')).exists();
      assert
        .dom(
          screen.getByText(
            'Modification infos candidat : Ajout/modification du temps majoré - Un signalement pas du tout impactant'
          )
        )
        .exists();
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
      const screen = await visitScreen('/certifications/123');

      // then
      assert.dom(screen.getByText('1 Signalement(s) impactant(s)')).exists();
      assert
        .dom(
          screen.getByText(
            'Autre (si aucune des catégories ci-dessus ne correspond au signalement) - Un signalement super impactant'
          )
        )
        .exists();
      assert.dom(screen.queryByText('Signalement(s) non impactant(s)')).doesNotExist();
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
      const screen = await visitScreen('/certifications/123');

      // then
      assert.dom(screen.getByText('1 Signalement(s) non impactant(s)')).exists();
      assert
        .dom(
          screen.getByText(
            'Modification infos candidat : Ajout/modification du temps majoré - Un signalement pas du tout impactant'
          )
        )
        .exists();
      assert.dom(screen.queryByText('Signalement(s) impactant(s)')).doesNotExist();
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

      module('when Resolve button is clicked on issue report', function () {
        module('when Resolve button is clicked', function () {
          module('when the api returns ok', function () {
            module('when a label is keyed', function () {
              test('it should set issue as resolved with label', async function (assert) {
                // given
                const certificationIssueReport = this.server.create('certification-issue-report', {
                  category: 'OTHER',
                  description: 'Un signalement impactant',
                  isImpactful: true,
                  resolvedAt: null,
                });
                certification.update({ certificationIssueReports: [certificationIssueReport] });
                this.server.patch(
                  `/certification-issue-reports/${certificationIssueReport.id}`,
                  (schema) => {
                    const certificationIssueReportToUpdate = schema.certificationIssueReports.find(
                      certificationIssueReport.id
                    );
                    certificationIssueReportToUpdate.update({ resolvedAt: new Date(), resolution: 'Fraud' });
                    return new Response({});
                  },
                  204
                );

                const screen = await visitScreen(`/certifications/${certification.id}`);
                await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(0));
                await fillByLabel('Résolution', 'Fraude');

                // when
                await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(1));

                // then
                assert.dom(screen.getByText('Le signalement a été résolu.')).exists();
                assert.dom('.certification-issue-report__details').containsText('Fraud');
              });
            });
          });
          module('when the api returns an error', function () {
            test('it should display an error notification', async function (assert) {
              // given
              const certificationIssueReport = this.server.create('certification-issue-report', {
                category: 'OTHER',
                description: 'Un signalement impactant',
                isImpactful: true,
                resolvedAt: null,
              });
              certification.update({ certificationIssueReports: [certificationIssueReport] });
              this.server.patch(
                `/certification-issue-reports/${certificationIssueReport.id}`,
                () => new Response({}),
                500
              );

              const screen = await visitScreen(`/certifications/${certification.id}`);

              await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(0));
              await fillByLabel('Résolution', 'Fraude');

              // when
              await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(1));

              // then
              assert.dom(screen.getByText(/une erreur est survenue/i)).exists();
              assert.dom(screen.queryByLabelText('Fraud')).doesNotExist();
            });
          });
        });
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
        const screen = await visitScreen('/certifications/123');

        // then
        assert
          .dom(
            screen.getByText(
              "Problème technique sur une question : L'image ne s'affiche pas - image disparue - Question 666"
            )
          )
          .exists();
      });
    });
  });

  module('when go to user detail button is clicked', function () {
    test('it should redirect to user detail page', async function (assert) {
      // given
      await visit(`/certifications/${certification.id}`);

      // when
      await clickByName("Voir les détails de l'utilisateur");

      // then
      assert.strictEqual(currentURL(), '/users/888');
    });
  });

  module('Certification cancellation', function () {
    module('Cancel', function (hooks) {
      hooks.beforeEach(async function () {
        certification.update({ status: 'validated' });
      });

      test('should display confirmation popup for cancellation when certification is not yet cancelled and cancellation button is clicked', async function (assert) {
        // given
        const screen = await visitScreen(`/certifications/${certification.id}`);

        // when
        await clickByName('Annuler la certification');

        // then
        assert
          .dom(
            screen.getByText(
              'Êtes-vous sûr·e de vouloir annuler cette certification ? Cliquez sur confirmer pour poursuivre.'
            )
          )
          .exists();
      });

      test('should not cancel the certification when aborting action in the confirmation popup', async function (assert) {
        // given
        const screen = await visitScreen(`/certifications/${certification.id}`);
        await clickByName('Annuler la certification');

        // when
        await clickByName('Close');

        // then
        assert.dom(screen.getByText('Validée')).exists();
        assert.dom(screen.getByText('Annuler la certification')).exists();
      });

      test('should cancel the certification when confirming action in the confirmation popup', async function (assert) {
        // given
        const screen = await visitScreen(`/certifications/${certification.id}`);
        await clickByName('Annuler la certification');

        // when
        await clickByName('Confirmer');

        // then
        assert.dom(screen.getByText('Annulée')).exists();
        assert.dom(screen.getByText('Désannuler la certification')).exists();
      });
    });

    module('Uncancel', function (hooks) {
      hooks.beforeEach(async function () {
        certification.update({ status: 'cancelled' });
      });

      test('should display confirmation popup for uncancellation when certification is cancelled and uncancellation button is clicked', async function (assert) {
        // given
        const screen = await visitScreen(`/certifications/${certification.id}`);

        // when
        await clickByName('Désannuler la certification');

        // then
        assert
          .dom(
            screen.getByText(
              'Êtes-vous sûr·e de vouloir désannuler cette certification ? Cliquez sur confirmer pour poursuivre.'
            )
          )
          .exists();
      });

      test('should not uncancel the certification when aborting action in the confirmation popup', async function (assert) {
        // given
        const screen = await visitScreen(`/certifications/${certification.id}`);
        await clickByName('Désannuler la certification');

        // when
        await clickByName('Close');

        // then
        assert.dom(screen.getByText('Annulée')).exists();
        assert.dom(screen.getByText('Désannuler la certification')).exists();
      });

      test('should uncancel the certification when confirming action in the confirmation popup', async function (assert) {
        // given
        const screen = await visitScreen(`/certifications/${certification.id}`);
        await clickByName('Désannuler la certification');

        // when
        await clickByName('Confirmer');

        // then
        assert.dom(screen.getByText('Validée')).exists();
        assert.dom(screen.getByText('Annuler la certification')).exists();
      });
    });
  });
});
