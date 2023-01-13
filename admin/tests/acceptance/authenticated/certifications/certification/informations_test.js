import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit, within } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Route | routes/authenticated/certifications/certification | informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certification;

  hooks.beforeEach(async function () {
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
    });
  });

  module('certification information read', function () {
    test('it displays candidate information', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/certifications/${certification.id}`);

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

    module('Certification issue reports section', function () {
      test('should not render the "Signalements" section when certification has no issue reports', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        certification.update({ certificationIssueReports: [] });

        // when
        const screen = await visit('/certifications/123');

        // then
        assert.dom(screen.queryByText('Signalements')).doesNotExist();
      });

      test('should render the "Signalements" section when certification has issue reports', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationIssueReport = this.server.create('certification-issue-report', {
          category: 'OTHER',
          description: 'Un signalement impactant',
          isImpactful: true,
        });
        certification.update({ certificationIssueReports: [certificationIssueReport] });

        // when
        const screen = await visit('/certifications/123');

        // then
        assert.dom(screen.getByText('Signalements')).exists();
      });

      test('should display the issue reports, impactful and non impactful', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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
        const screen = await visit('/certifications/123');

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
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationIssueReportImpactful = this.server.create('certification-issue-report', {
          category: 'OTHER',
          description: 'Un signalement super impactant',
          isImpactful: true,
        });
        certification.update({ certificationIssueReports: [certificationIssueReportImpactful] });

        // when
        const screen = await visit('/certifications/123');

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
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationIssueReportNonImpactful = this.server.create('certification-issue-report', {
          category: 'CANDIDATE_INFORMATIONS_CHANGES',
          subcategory: 'EXTRA_TIME_PERCENTAGE',
          description: 'Un signalement pas du tout impactant',
          isImpactful: false,
        });
        certification.update({ certificationIssueReports: [certificationIssueReportNonImpactful] });

        // when
        const screen = await visit('/certifications/123');

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

      test('should display a resolved issue report when resolved', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationIssueReportImpactful = this.server.create('certification-issue-report', {
          category: 'OTHER',
          description: 'Un signalement super impactant',
          isImpactful: true,
          resolvedAt: new Date('2020-01-01'),
        });
        certification.update({ certificationIssueReports: [certificationIssueReportImpactful] });

        // when
        const screen = await visit('/certifications/123');

        // then
        assert.dom(screen.getByLabelText('Signalement résolu')).exists();
        assert.dom(screen.queryByLabelText('Signalement non résolu')).doesNotExist();
      });

      test('should display a non-resolved issue report when not resolved', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const certificationIssueReportImpactful = this.server.create('certification-issue-report', {
          category: 'OTHER',
          description: 'Un signalement super impactant',
          isImpactful: true,
          resolvedAt: null,
        });
        certification.update({ certificationIssueReports: [certificationIssueReportImpactful] });

        // when
        const screen = await visit('/certifications/123');

        // then
        assert.dom(screen.getByLabelText('Signalement non résolu')).exists();
        assert.dom(screen.queryByLabelText('Signalement résolu')).doesNotExist();
      });

      module('IN_CHALLENGE issue report', function () {
        test('should display a "in challenge" issue report with its challenge number', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const certificationIssueReport = this.server.create('certification-issue-report', {
            category: 'IN_CHALLENGE',
            subcategory: 'IMAGE_NOT_DISPLAYING',
            description: 'image disparue',
            questionNumber: 666,
            isImpactful: true,
          });
          certification.update({ certificationIssueReports: [certificationIssueReport] });

          // when
          const screen = await visit('/certifications/123');

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
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        await visit(`/certifications/${certification.id}`);

        // when
        await clickByName("Voir les détails de l'utilisateur");

        // then
        assert.strictEqual(currentURL(), '/users/888');
      });
    });
  });

  module('certification edition actions', function () {
    module('Candidate information edition', function () {
      module('when candidate certification was enrolled before the CPF feature was enabled', function () {
        test('should prevent user from editing candidate information', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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
          const screen = await visit('/certifications/456');

          // then
          assert.dom(screen.getByText('Voir avec PO/Dev pour modifier les infos candidat.')).exists();
          assert.dom(screen.queryByLabelText('Modifier les informations du candidat')).isDisabled();
        });
      });

      module('when there is a complementary certification course result with external', function () {
        test('should be possible to update jury level', async function (assert) {
          //given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const complementaryCertificationCourseResultsWithExternal = server.create(
            'complementary-certification-course-results-with-external',
            {
              complementaryCertificationCourseId: 1234,
              pixResult: 'Pix+ Édu Initiale 1er degré Initié (entrée dans le métier)',
              externalResult: 'En attente',
              finalResult: 'En attente',
              allowedExternalLevels: [
                {
                  value: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
                  label: 'Pix+ Édu Initiale 1er degré Confirmé',
                },
              ],
            }
          );
          certification.update({
            complementaryCertificationCourseResultsWithExternal,
          });

          this.server.post('/admin/complementary-certification-course-results', (schema) => {
            const complementaryCertificationCourseResultsWithExternal =
              schema.complementaryCertificationCourseResultsWithExternals.first();

            complementaryCertificationCourseResultsWithExternal.update({
              externalResult: 'Pix+ Édu Initiale 1er degré Confirmé',
              finalResult: 'Pix+ Édu Initiale 1er degré Initié (entrée dans le métier)',
            });
          });

          const screen = await visit(`/certifications/${certification.id}`);

          // when
          await click(screen.getByRole('button', { name: 'Modifier le volet jury' }));

          await click(screen.getByRole('button', { name: 'Sélectionner un niveau' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Pix+ Édu Initiale 1er degré Confirmé' }));

          await click(screen.getByRole('button', { name: 'Modifier le niveau du jury' }));

          const finalResult = within(screen.getByText('NIVEAU FINAL').parentElement);

          // then
          assert.dom(screen.getByText('Pix+ Édu Initiale 1er degré Confirmé')).exists();

          assert.dom(finalResult.getByText('Pix+ Édu Initiale 1er degré Initié (entrée dans le métier)')).exists();
        });

        /**
         * This test has been created to ensure a bug is fixed
         * Step to reproduce :
         * - open select of jury level option of one Pix+ Edu 1er degré certification
         * - open select of jury level option of Pix+ Edu 2nd degré certification in the same session
         * - expected bug result : jury level options should be only Pix+ Edu 1er degré
         */
        test('it should not display previously opened jury level options', async function (assert) {
          //given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          this.server.create('user', { id: 777 });
          this.server.create('user', { id: 666 });
          const juryCertificationSummaries = [
            server.create('jury-certification-summary', {
              id: 123,
            }),
            server.create('jury-certification-summary', {
              id: 456,
            }),
          ];
          const session = server.create('session', { id: 321, juryCertificationSummaries });
          const complementaryCertificationCourseResultsWithExternal1 = server.create(
            'complementary-certification-course-results-with-external',
            {
              complementaryCertificationCourseId: 1234,
              pixResult: 'Pix+ Édu Initiale 1er degré Initié (entrée dans le métier)',
              externalResult: 'En attente',
              finalResult: 'En attente',
              allowedExternalLevels: [
                {
                  value: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
                  label: 'Pix+ Édu Initiale 1er degré Confirmé',
                },
              ],
            }
          );
          const certification1 = this.server.create('certification', {
            id: 398,
            sessionId: session.id,
            userId: 777,
            complementaryCertificationCourseResultsWithExternal: complementaryCertificationCourseResultsWithExternal1,
            competencesWithMark: [],
          });

          const complementaryCertificationCourseResultsWithExternal2 = server.create(
            'complementary-certification-course-results-with-external',
            {
              complementaryCertificationCourseId: 5678,
              pixResult: 'Pix+ Édu Initiale 2nd degré Initié (entrée dans le métier)',
              externalResult: 'En attente',
              finalResult: 'En attente',
              allowedExternalLevels: [
                {
                  value: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME',
                  label: 'Pix+ Édu Initiale 2nd degré Confirmé',
                },
              ],
            }
          );
          const certification2 = this.server.create('certification', {
            id: 456,
            userId: 666,
            sessionId: session.id,
            complementaryCertificationCourseResultsWithExternal: complementaryCertificationCourseResultsWithExternal2,
            competencesWithMark: [],
          });

          const screen = await visit(`/certifications/${certification1.id}`);
          await click(screen.getByRole('button', { name: 'Modifier le volet jury' }));
          await _switchCertificationDetail(screen, session.id, certification2.id);

          // when
          await click(screen.getByRole('button', { name: 'Sélectionner un niveau' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Pix+ Édu Initiale 2nd degré Confirmé' }));

          // then
          assert
            .dom(screen.getByRole('button', { name: 'Sélectionner un niveau' }))
            .containsText('Pix+ Édu Initiale 2nd degré Confirmé');
        });
      });

      test('it displays common complementary certifications result', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const commonComplementaryCertificationCourseResults = [
          server.create('common-complementary-certification-course-result', {
            label: 'CléA Numérique',
            status: 'Validée',
          }),
          server.create('common-complementary-certification-course-result', {
            label: 'Pix+ Droit Maître',
            status: 'Validée',
          }),
          server.create('common-complementary-certification-course-result', {
            label: 'Pix+ Droit Expert',
            status: 'Rejetée',
          }),
        ];

        certification.update({
          commonComplementaryCertificationCourseResults,
        });

        // when
        const screen = await visit(`/certifications/${certification.id}`);

        // then
        assert.dom(screen.getByText('Certifications complémentaires')).exists();
        assert.dom(screen.queryByText('Résultats de la certification complémentaire Pix+ Edu :')).doesNotExist();
        assert.dom(screen.getByText('CléA Numérique :')).exists();
        assert.dom(screen.getByText('Pix+ Droit Maître :')).exists();
        assert.dom(screen.getByText('Pix+ Droit Expert :')).exists();
        assert.strictEqual(screen.getAllByText('Validée').length, 2);
        assert.strictEqual(screen.getAllByText('Rejetée').length, 1);
      });

      test('it displays external complementary certifications', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const complementaryCertificationCourseResultsWithExternal = server.create(
          'complementary-certification-course-results-with-external',
          {
            complementaryCertificationCourseId: 1234,
            pixResult: 'Pix+ Édu Initié (entrée dans le métier)',
            externalResult: 'Pix+ Édu Avancé',
            finalResult: 'Pix+ Édu Initié (entrée dans le métier)',
          }
        );
        certification.update({
          complementaryCertificationCourseResultsWithExternal,
        });

        // when
        const screen = await visit(`/certifications/${certification.id}`);

        // then
        assert.dom(screen.getByText('Résultats de la certification complémentaire Pix+ Edu :')).exists();
        assert.dom(screen.getByText('VOLET PIX')).exists();
        assert.dom(screen.getByText('VOLET JURY')).exists();
        assert.dom(screen.getByText('NIVEAU FINAL')).exists();
        assert.strictEqual(screen.getAllByText('Pix+ Édu Initié (entrée dans le métier)').length, 2);
        assert.strictEqual(screen.getAllByText('Pix+ Édu Avancé').length, 1);
      });

      module('when candidate certification was enrolled with CPF data', function () {
        module('when editing candidate information succeeds', function () {
          test('should save the candidate information data when modifying them', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            const screen = await visit('/certifications/123');
            await clickByName('Modifier les informations du candidat');
            await screen.findByRole('dialog');
            // when
            await fillByLabel('Nom de famille', 'Summers');
            await fillByLabel('Commune de naissance', 'Sunnydale');
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
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            const screen = await visit('/certifications/123');
            await clickByName('Modifier les informations du candidat');
            await screen.findByRole('dialog');
            // when
            await fillByLabel('Nom de famille', 'Summers');
            await fillByLabel('Commune de naissance', 'Sunnydale');
            await clickByName('Enregistrer');

            // then
            assert.dom(screen.getByText('Les informations du candidat ont bien été enregistrées.')).exists();
          });

          test('should close the modal', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            const screen = await visit('/certifications/123');
            await clickByName('Modifier les informations du candidat');
            await screen.findByRole('dialog');
            // when
            await fillByLabel('Nom de famille', 'Summers');
            await fillByLabel('Commune de naissance', 'Sunnydale');
            await clickByName('Enregistrer');

            // then
            assert.dom(screen.queryByText('Éditer les informations du candidat')).doesNotExist();
          });
        });

        module('when editing candidate information fails', function () {
          test('should display an error notification', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            this.server.patch(
              '/certification-courses/:id',
              () => ({
                errors: [{ detail: "Candidate's first name must not be blank or empty" }],
              }),
              422
            );
            const screen = await visit(`/certifications/${certification.id}`);
            await clickByName('Modifier les informations du candidat');
            await screen.findByRole('dialog');

            await fillByLabel('Nom de famille', 'Summers');

            // when
            await clickByName('Enregistrer');

            // then
            assert.dom(screen.getByText("Candidate's first name must not be blank or empty")).exists();
          });

          test('should leave the modal opened', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            this.server.patch(
              '/certification-courses/:id',
              () => ({
                errors: [{ detail: "Candidate's first name must not be blank or empty" }],
              }),
              422
            );
            const screen = await visit(`/certifications/${certification.id}`);
            await clickByName('Modifier les informations du candidat');
            await screen.findByRole('dialog');

            await fillByLabel('Nom de famille', 'Summers');

            // when
            await clickByName('Enregistrer');

            // then
            assert.dom(screen.getByRole('heading', { name: 'Éditer les informations du candidat' })).exists();
          });

          test('should leave candidate information untouched when aborting the edition', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            this.server.patch(
              '/certification-courses/:id',
              () => ({
                errors: [{ detail: "Candidate's first name must not be blank or empty" }],
              }),
              422
            );
            const screen = await visit(`/certifications/${certification.id}`);
            await clickByName('Modifier les informations du candidat');

            await screen.findByRole('dialog');

            await fillByLabel('Nom de famille', 'Summers');
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
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/certifications/${certification.id}`);
          await clickByName('Modifier les résultats du candidat');

          // then
          assert.dom(screen.getByLabelText('Modifier les informations du candidat')).isDisabled();
        });
      });

      module('when candidate results form cancel button is clicked', function () {
        test('it re-enables candidate informations edit button', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/certifications/${certification.id}`);
          await clickByName('Modifier les résultats du candidat');
          await clickByName('Annuler la modification des résultats du candidat');

          // then
          assert.dom(screen.getByLabelText('Modifier les informations du candidat')).exists().isEnabled();
        });
      });

      module('when candidate results form is submitted', function () {
        test('it also re-enables candidate informations edit button', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/certifications/${certification.id}`);
          await clickByName('Modifier les résultats du candidat');
          await clickByName('Enregistrer les résultats du candidat');

          await screen.findByRole('dialog');

          await clickByName('Confirmer');

          // then
          assert.dom(screen.getByLabelText('Modifier les informations du candidat')).exists().isEnabled();
        });
      });
    });

    module('Certification issue reports section', function () {
      module('Impactful issue reports resolution', function () {
        module('when Resolve button is clicked on issue report', function () {
          module('when the api returns ok', function () {
            module('when a label is keyed', function () {
              test('it should set issue as resolved with label', async function (assert) {
                // given
                await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
                const certificationIssueReport = this.server.create('certification-issue-report', {
                  category: 'OTHER',
                  description: 'Un signalement impactant',
                  isImpactful: true,
                  resolvedAt: null,
                });
                certification.update({ certificationIssueReports: [certificationIssueReport] });
                const resolution = 'Fraude';
                this.server.patch(
                  `/certification-issue-reports/${certificationIssueReport.id}`,
                  (schema) => {
                    const certificationIssueReportToUpdate = schema.certificationIssueReports.find(
                      certificationIssueReport.id
                    );
                    certificationIssueReportToUpdate.update({ resolvedAt: new Date(), resolution });
                    return new Response({});
                  },
                  204
                );

                const screen = await visit(`/certifications/${certification.id}`);
                await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(0));

                await screen.findByRole('dialog');

                await fillByLabel('Résolution', resolution);

                // when
                await click(screen.getAllByRole('button', { name: 'Résoudre ce signalement' }).at(0));

                // then
                assert.dom(screen.getByText('Le signalement a été résolu.')).exists();
                assert.dom(screen.getByText('Résolution : Fraude')).exists();
              });
            });
          });
          module('when the api returns an error', function () {
            test('it should display an error notification', async function (assert) {
              // given
              await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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

              const screen = await visit(`/certifications/${certification.id}`);

              await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(0));
              await screen.findByRole('dialog');
              await fillByLabel('Résolution', 'Fraude');

              // when
              await click(screen.getAllByRole('button', { name: 'Résoudre ce signalement' }).at(0));

              // then
              assert.dom(screen.getByText(/une erreur est survenue/i)).exists();
              assert.dom(screen.queryByLabelText('Fraud')).doesNotExist();
            });
          });
        });
      });
    });

    module('Certification cancellation', function () {
      module('Cancel', function (hooks) {
        hooks.beforeEach(async function () {
          certification.update({ status: 'validated' });
        });

        test('should display confirmation popup for cancellation when certification is not yet cancelled and cancellation button is clicked', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const screen = await visit(`/certifications/${certification.id}`);

          // when
          await clickByName('Annuler la certification');

          await screen.findByRole('dialog');
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
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const screen = await visit(`/certifications/${certification.id}`);
          await clickByName('Annuler la certification');

          await screen.findByRole('dialog');
          // when
          await clickByName('Fermer');

          // then
          assert.dom(screen.getByText('Validée')).exists();
          assert.dom(screen.getByRole('button', { name: 'Annuler la certification' })).exists();
        });

        test('should cancel the certification when confirming action in the confirmation popup', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const screen = await visit(`/certifications/${certification.id}`);
          await clickByName('Annuler la certification');

          await screen.findByRole('dialog');

          // when
          await clickByName('Confirmer');

          // then
          assert.dom(screen.getByText('Annulée')).exists();
          assert.dom(screen.getByRole('button', { name: 'Désannuler la certification' })).exists();
        });
      });

      module('Uncancel', function (hooks) {
        hooks.beforeEach(async function () {
          certification.update({ status: 'cancelled' });
        });

        test('should display confirmation popup for uncancellation when certification is cancelled and uncancellation button is clicked', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const screen = await visit(`/certifications/${certification.id}`);

          // when
          await clickByName('Désannuler la certification');
          await screen.findByRole('dialog');
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
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const screen = await visit(`/certifications/${certification.id}`);
          await clickByName('Désannuler la certification');

          await screen.findByRole('dialog');

          // when
          await clickByName('Fermer');

          // then
          assert.dom(screen.getByText('Annulée')).exists();
          assert.dom(screen.getByRole('button', { name: 'Désannuler la certification' })).exists();
        });

        test('should uncancel the certification when confirming action in the confirmation popup', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          const screen = await visit(`/certifications/${certification.id}`);
          await clickByName('Désannuler la certification');

          await screen.findByRole('dialog');
          // when
          await clickByName('Confirmer');

          // then
          assert.dom(screen.getByText('Validée')).exists();
          assert.dom(screen.getByRole('button', { name: 'Annuler la certification' })).exists();
        });
      });
    });
  });
});

async function _switchCertificationDetail(screen, sessionId, certificationId) {
  await click(screen.getByRole('link', { name: sessionId }));
  await click(screen.getByLabelText('Liste des certifications de la session'));
  await click(screen.getByRole('link', { name: certificationId }));
}
