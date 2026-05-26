import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { assessmentResultStatus } from 'pix-admin/models/certification';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Route | routes/authenticated/sessions/certification | informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certification, session;

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

    session = this.server.create('session', {
      finalizedAt: new Date('2020-01-01'),
    });

    certification = this.server.create('certification', {
      id: 123,
      sessionId: session.id,
      firstName: 'Bora Horza',
      lastName: 'Gobuchul',
      birthdate: '1987-07-24',
      birthplace: 'Sorpen',
      userId: 888,
      sex: 'M',
      isPublished: false,
      isRejectedForFraud: false,
      birthCountry: 'JAPON',
      birthInseeCode: '99217',
      birthPostalCode: null,
      version: 2,
      status: assessmentResultStatus.VALIDATED,
      competencesWithMark: [
        {
          id: 152825,
          area_code: '1',
          competence_code: '1.1',
          competenceId: 'competence1I1RdLLWjvuLVE',
          level: 4,
          score: 10,
          assessmentResultId: 164409,
        },
      ],
      listChallengesAndAnswers: [],
      createdAt: new Date('2020-01-01'),
    });
  });

  test('it displays header information', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    // when
    const screen = await visit(`/sessions/certification/${certification.id}`);

    // then
    assert.dom(screen.getByRole('heading', { name: `Certif ${certification.id}` })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Rechercher une certification avec un identifiant' })).exists();
  });

  module('certification information read', function () {
    test('it displays the score details by competence', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/sessions/certification/${certification.id}`);

      // then
      const table = screen.getByRole('table', { name: 'Détails du résultat par compétence' });
      const rows = await within(table).findAllByRole('row');

      assert.dom(within(table).getByRole('columnheader', { name: 'Compétence' })).exists();
      assert.dom(within(table).getByRole('columnheader', { name: 'Score' })).exists();
      assert.dom(within(table).getByRole('columnheader', { name: 'Niveau' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '1.1' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '10' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '4' })).exists();
    });

    module('Certification issue reports section', function () {
      test('should not render the "Signalements" section when certification has no issue reports', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        certification.update({ certificationIssueReports: [] });

        // when
        const screen = await visit('/sessions/certification/123');

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
        const screen = await visit('/sessions/certification/123');

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
        const screen = await visit('/sessions/certification/123');

        // then
        assert.dom(screen.getByText('1 Signalement(s) impactant(s)')).exists();
        assert
          .dom(
            screen.getByText(
              'Autre (si aucune des catégories ci-dessus ne correspond au signalement) - Un signalement super impactant',
            ),
          )
          .exists();
        assert.dom(screen.getByText('1 Signalement(s) non impactant(s)')).exists();
        assert
          .dom(
            screen.getByText(
              'Modification infos candidat : Ajout/modification du temps majoré - Un signalement pas du tout impactant',
            ),
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
        const screen = await visit('/sessions/certification/123');

        // then
        assert.dom(screen.getByText('1 Signalement(s) impactant(s)')).exists();
        assert
          .dom(
            screen.getByText(
              'Autre (si aucune des catégories ci-dessus ne correspond au signalement) - Un signalement super impactant',
            ),
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
        const screen = await visit('/sessions/certification/123');

        // then
        assert.dom(screen.getByText('1 Signalement(s) non impactant(s)')).exists();
        assert
          .dom(
            screen.getByText(
              'Modification infos candidat : Ajout/modification du temps majoré - Un signalement pas du tout impactant',
            ),
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
        const screen = await visit('/sessions/certification/123');

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
        const screen = await visit('/sessions/certification/123');

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
          const screen = await visit('/sessions/certification/123');

          // then
          assert
            .dom(
              screen.getByText(
                "Problème technique sur une question : L'image ne s'affiche pas - image disparue - Question 666",
              ),
            )
            .exists();
        });
      });
    });

    module('when go to user detail button is clicked', function () {
      test('it should redirect to user detail page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        await visit(`/sessions/certification/${certification.id}`);

        // when
        await clickByName("Voir les détails de l'utilisateur");

        // then
        assert.strictEqual(currentURL(), '/users/888');
      });
    });
  });

  module('certification edition actions', function () {
    module('Candidate information edition', function () {
      module('when there is a complementary certification course result with external', function () {
        test('should be possible to update jury level', async function (assert) {
          //given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          certification.update({ certificationFramework: 'EDU_1ER_DEGRE' });
          const complementaryCertificationCourseResultWithExternal = server.create(
            'complementary-certification-course-result-with-external',
            {
              complementaryCertificationCourseId: 1234,
              pixResult: 'Pix+ Édu Initiale 1er degré Initié (entrée dans le métier)',
              externalResult: 'En attente',
              finalResult: 'En attente',
              defaultJuryOptions: ['UNSET', 'WAITING'],
              allowedExternalLevels: [
                {
                  value: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
                  label: 'Pix+ Édu Initiale 1er degré Confirmé',
                },
              ],
            },
          );
          certification.update({
            complementaryCertificationCourseResultWithExternal,
          });

          const screen = await visit(`/sessions/certification/${certification.id}`);

          // when
          await click(screen.getByRole('button', { name: 'Modifier le volet jury' }));

          await click(screen.getByRole('button', { name: 'Sélectionner un niveau' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Pix+ Édu Initiale 1er degré Confirmé' }));

          await click(screen.getByRole('button', { name: 'Modifier le niveau du jury' }));

          const finalResult = within(screen.getByText('Niveau final').parentElement);

          // then
          assert.dom(screen.getByText('Pix+ Édu Initiale 1er degré Confirmé')).exists();

          assert.dom(finalResult.getByText('Pix+ Édu Initiale 1er degré Initié (entrée dans le métier)')).exists();
        });

        test('should be possible to unset jury level', async function (assert) {
          //given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          certification.update({ certificationFramework: 'EDU_1ER_DEGRE' });
          const complementaryCertificationCourseResultWithExternal = server.create(
            'complementary-certification-course-result-with-external',
            {
              id: 456,
              complementaryCertificationCourseId: 1234,
              pixResult: 'Pix+ Édu Initiale 1er degré Confirmé',
              externalResult: 'Pix+ Édu Initiale 1er degré Confirmé',
              finalResult: 'Pix+ Édu Initiale 1er degré Confirmé',
              allowedExternalLevels: [
                {
                  value: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
                  label: 'Pix+ Édu Initiale 1er degré Confirmé',
                },
              ],
              defaultJuryOptions: ['UNSET'],
            },
          );
          certification.update({ complementaryCertificationCourseResultWithExternal });

          this.server.post('/admin/complementary-certification-course-results', (schema) => {
            const complementaryCertificationCourseResultWithExternal =
              schema.complementaryCertificationCourseResultWithExternals.find(456);

            complementaryCertificationCourseResultWithExternal.update({
              externalResult: 'En attente',
              finalResult: 'En attente Volet jury',
            });

            return schema.certifications.first();
          });

          const screen = await visit(`/sessions/certification/${certification.id}`);

          // when
          await click(screen.getByRole('button', { name: 'Modifier le volet jury' }));

          await click(screen.getByRole('button', { name: 'Sélectionner un niveau' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'En attente' }));

          await click(screen.getByRole('button', { name: 'Modifier le niveau du jury' }));

          const finalResult = within(screen.getByText('Niveau final').parentElement);

          // then
          assert.dom(screen.getByText('En attente')).exists();

          assert.dom(finalResult.getByText('En attente Volet jury')).exists();
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
          certification.update({ certificationFramework: 'EDU_1ER_DEGRE' });
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
          const complementaryCertificationCourseResultWithExternal1 = server.create(
            'complementary-certification-course-result-with-external',
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
              defaultJuryOptions: ['UNSET', 'WAITING'],
            },
          );
          const certification1 = this.server.create('certification', {
            id: 398,
            sessionId: session.id,
            userId: 777,
            certificationFramework: 'EDU_1ER_DEGRE',
            complementaryCertificationCourseResultWithExternal: complementaryCertificationCourseResultWithExternal1,
            competencesWithMark: [],
          });

          const complementaryCertificationCourseResultWithExternal2 = server.create(
            'complementary-certification-course-result-with-external',
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
              defaultJuryOptions: ['UNSET', 'WAITING'],
            },
          );
          const certification2 = this.server.create('certification', {
            id: 456,
            userId: 666,
            sessionId: session.id,
            certificationFramework: 'EDU_2ND_DEGRE',
            complementaryCertificationCourseResultWithExternal: complementaryCertificationCourseResultWithExternal2,
            competencesWithMark: [],
          });

          const screen = await visit(`/sessions/certification/${certification1.id}`);
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
        const commonComplementaryCertificationCourseResult = server.create(
          'common-complementary-certification-course-result',
          {
            label: 'CléA Numérique',
            status: 'Annulée',
          },
        );

        certification.update({
          commonComplementaryCertificationCourseResult,
        });

        // when
        const screen = await visit(`/sessions/certification/${certification.id}`);

        // then
        assert.dom(screen.getByText('Certification complémentaire')).exists();
        assert.dom(screen.queryByText('Résultats de la certification complémentaire Pix+ Edu')).doesNotExist();
        assert.dom(screen.getByText('CléA Numérique')).exists();
        assert.dom(screen.getByText('Annulée')).exists();
      });

      test('it displays external complementary certifications', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        certification.update({ certificationFramework: 'EDU_1ER_DEGRE' });
        const complementaryCertificationCourseResultWithExternal = server.create(
          'complementary-certification-course-result-with-external',
          {
            complementaryCertificationCourseId: 1234,
            pixResult: 'Pix+ Édu Initié (entrée dans le métier)',
            externalResult: 'Pix+ Édu Avancé',
            finalResult: 'Pix+ Édu Initié (entrée dans le métier)',
          },
        );
        certification.update({
          complementaryCertificationCourseResultWithExternal,
        });

        // when
        const screen = await visit(`/sessions/certification/${certification.id}`);

        // then
        assert.dom(screen.getByText('Résultats de la certification complémentaire Pix+ Édu')).exists();
        assert.dom(screen.getByText('Volet Pix')).exists();
        assert.dom(screen.getByText('Volet jury')).exists();
        assert.dom(screen.getByText('Niveau final')).exists();
        assert.strictEqual(screen.getAllByText('Pix+ Édu Initié (entrée dans le métier)').length, 2);
        assert.strictEqual(screen.getAllByText('Pix+ Édu Avancé').length, 1);
      });
    });

    module('when certification is v3 Pix+ Edu', function () {
      test('should be possible to update the external jury level', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        certification.update({
          version: 3,
          isPublished: true,
          certificationFramework: 'EDU_1ER_DEGRE',
          reachedResultKey: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE.0',
        });

        const screen = await visit(`/sessions/certification/${certification.id}`);

        // when
        await click(screen.getByRole('button', { name: 'Modifier le volet jury' }));

        await click(screen.getByRole('button', { name: 'Sélectionner un niveau' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Avancé' }));

        await clickByName('Enregistrer');

        // then
        assert.dom(await screen.findByText('Le résultat du volet jury externe a bien été enregistré')).exists();
      });
    });

    module('when certification is v3 Pix+ Droit', function () {
      test('it displays the certification result with the correct mesh level label', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        certification.update({
          version: 3,
          isPublished: true,
          certificationFramework: 'DROIT',
          reachedResultKey: 'DROIT.0',
          algorithmVersion: 3,
        });

        // when
        const screen = await visit(`/sessions/certification/${certification.id}`);

        // then
        assert.dom(screen.getByText('Indépendant')).exists();
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
                      certificationIssueReport.id,
                    );
                    certificationIssueReportToUpdate.update({ resolvedAt: new Date(), resolution });
                  },
                  204,
                );

                const screen = await visit(`/sessions/certification/${certification.id}`);
                await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(0));

                await screen.findByRole('dialog');

                await fillByLabel('Résolution', resolution);

                // when
                await click(screen.getAllByRole('button', { name: 'Résoudre ce signalement' }).at(0));

                // then
                assert.dom(await screen.findByText('Le signalement a été résolu.')).exists();
                assert.dom(await screen.findByText('Résolution : Fraude')).exists();
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
                500,
              );

              const screen = await visit(`/sessions/certification/${certification.id}`);

              await click(screen.getAllByRole('button', { name: 'Résoudre le signalement' }).at(0));
              await screen.findByRole('dialog');
              await fillByLabel('Résolution', 'Fraude');

              // when
              await click(screen.getAllByRole('button', { name: 'Résoudre ce signalement' }).at(0));

              // then
              assert.dom(await screen.findByText(/une erreur est survenue/i)).exists();
              assert.dom(screen.queryByLabelText('Fraud')).doesNotExist();
            });
          });
        });
      });
    });

    module('Certification jury comments edition', function () {
      module('when jury comments edit button is clicked', function () {
        test('it displays the jury comments edition form', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/sessions/certification/${certification.id}`);
          await clickByName('Modifier le commentaire jury');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Notes internes Jury Pix' })).exists();
          assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
          assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
        });
      });

      module('when jury comments form cancel button is clicked', function () {
        test('it returns to the non-editable mode', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/sessions/certification/${certification.id}`);
          await clickByName('Modifier le commentaire jury');
          await clickByName('Annuler');

          // then
          assert.dom(screen.getByRole('button', { name: 'Modifier le commentaire jury' })).exists();
        });
      });

      module('when jury comments results form is submitted', function () {
        module('when the form is successfully submitted', function () {
          test('it displays a success notification', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

            // when
            const screen = await visit(`/sessions/certification/${certification.id}`);
            await clickByName('Modifier le commentaire jury');
            await fillByLabel('Notes internes Jury Pix', 'Whatever jury said');

            await clickByName('Enregistrer');

            // then
            assert.dom(screen.getByRole('button', { name: 'Modifier le commentaire jury' })).exists();
            assert.dom(screen.getByText('Le commentaire du jury a bien été enregistré.')).exists();
          });
        });

        module('when the form is submitted with an error', function () {
          test('it displays an error notification', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

            server.post('/admin/certification-courses/:id/assessment-results', () => {
              return new Response(400);
            });

            // when
            const screen = await visit(`/sessions/certification/${certification.id}`);
            await clickByName('Modifier le commentaire jury');
            await fillByLabel('Notes internes Jury Pix', 'Whatever jury said');

            await clickByName('Enregistrer');

            // then
            assert.dom(screen.queryByText('button', { name: 'Modifier le commentaire jury' })).doesNotExist();
            assert.dom(screen.getByText("Le commentaire du jury n'a pas pu être enregistré.")).exists();
          });
        });
      });
    });

    module('Certification rescoring', function () {
      module('when rescoring button is clicked', function () {
        test('it displays a success notification', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/sessions/certification/${certification.id}`);
          await click(screen.getByRole('button', { name: 'Re-scorer la certification' }));

          // then
          assert.dom(await screen.findByText('La certification a bien été rescorée.')).exists();
        });

        module('when an error occurred', function () {
          test('it displays an error notification', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

            // when
            const screen = await visit(`/sessions/certification/${certification.id}`);
            this.server.post(`/admin/certifications/${certification.id}/rescore`, () => ({}), 400);

            await click(screen.getByRole('button', { name: 'Re-scorer la certification' }));

            // then
            assert
              .dom(await screen.findByText('Une erreur est survenue lors du rescoring de la certification.'))
              .exists();
          });
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
