import { module, test } from 'qunit';
import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const answers = [
  {
    id: 1,
    questionNumber: '1',
    answerStatus: 'ok',
    answerStatusName: 'OK',
    validatedLiveAlert: false,
    answeredAt: new Date('2020-01-01T17:10:00Z'),
    competenceName: 'Aiguiser les couteaux',
    competenceIndex: '1.1',
    skillName: '@rec123',
  },
  {
    id: 2,
    questionNumber: '2',
    answerStatus: 'ko',
    answerStatusName: 'KO',
    validatedLiveAlert: false,
    answeredAt: new Date('2020-01-01T17:11:00Z'),
    competenceName: 'Lancer les couteaux',
    competenceIndex: '1.2',
    skillName: '@rec124',
  },
  {
    id: 3,
    questionNumber: '[3]',
    answerStatus: null,
    answerStatusName: 'Signalement validé',
    validatedLiveAlert: true,
    answeredAt: new Date('2020-01-01T17:12:00Z'),
    competenceName: 'Tester les couteaux',
    competenceIndex: '1.4',
    skillName: '@rec125',
  },
  {
    id: 4,
    questionNumber: '3',
    answerStatus: 'aband',
    answerStatusName: 'Abandonnée',
    validatedLiveAlert: false,
    answeredAt: new Date('2020-01-01T17:13:00Z'),
    competenceName: 'Forger les couteaux',
    competenceIndex: '1.3',
    skillName: '@rec124',
  },
];

module('Integration | Component | Certifications | certification > details v3', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#display', function () {
    module('certification "general informations" section', function (hooks) {
      let certificationChallengesForAdministration;
      let certificationCourseDetailsRecord;

      hooks.beforeEach(function () {
        certificationChallengesForAdministration = [
          store.createRecord('certification-challenges-for-administration', {
            validatedLiveAlert: false,
            answeredAt: null,
          }),
        ];

        certificationCourseDetailsRecord = {
          certificationChallengesForAdministration,
          store,
          params: {
            certificationCourseId: 123456,
            // eslint-disable-next-line no-restricted-syntax
            createdAt: new Date('2023-01-13T08:00:00'),
            assessmentResultStatus: 'validated',
          },
        };
      });

      test('should display the title, the creation date and the pix score', async function (assert) {
        // given
        this.model = createCertificationCourseDetailsRecord(certificationCourseDetailsRecord);

        // when
        const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

        const creationDate = await screen.getByLabelText('Créée le :').innerText;

        // then
        const pixScoreLabel = this.intl.t(
          'pages.certifications.certification.details.v3.general-informations.labels.pix-score',
        );

        assert.dom(screen.getByRole('heading', { name: 'Certification N°123456', level: 2 })).exists();
        assert.dom(screen.getByLabelText(`${pixScoreLabel} :`)).exists();
        assert.strictEqual(creationDate, '13/01/2023 08:00:00');
      });

      module('when the certification is valid', function () {
        test('should display the validated assessment result status with the right color', async function (assert) {
          // given
          this.model = createCertificationCourseDetailsRecord(certificationCourseDetailsRecord);

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          const assessmentResultStatusElement = screen.getByText(
            this.intl.t('pages.certifications.certification.details.v3.assessment-result-status.validated'),
          );

          assert.dom(assessmentResultStatusElement).exists();
          assert.true(assessmentResultStatusElement.classList.contains('pix-tag--success'));
        });

        test('should display the date of completion', async function (assert) {
          // given
          this.model = createCertificationCourseDetailsRecord(certificationCourseDetailsRecord);

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          const endedAtLabel = this.intl.t(
            'pages.certifications.certification.details.v3.general-informations.labels.ended-at',
          );

          assert.dom(screen.getByText(`${endedAtLabel} :`)).exists();
        });

        test('should NOT display the ended by info or the abort reason', async function (assert) {
          // given
          this.model = createCertificationCourseDetailsRecord(certificationCourseDetailsRecord);

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          const endedAtLabel = this.intl.t(
            'pages.certifications.certification.details.v3.general-informations.labels.ended-by',
          );

          const abortReasonLabel = this.intl.t(
            'pages.certifications.certification.details.v3.general-informations.labels.abort-reason',
          );

          assert.strictEqual(screen.queryByText(`${endedAtLabel} :`), null);
          assert.strictEqual(screen.queryByText(`${abortReasonLabel} :`), null);
        });
      });

      module('when the certification is rejected', function (hooks) {
        hooks.beforeEach(function () {
          certificationCourseDetailsRecord = {
            certificationChallengesForAdministration,
            store,
            params: {
              certificationCourseId: 123456,
              // eslint-disable-next-line no-restricted-syntax
              createdAt: new Date('2023-01-13T08:00:00'),
              abortReason: 'candidate',
              assessmentResultStatus: 'rejected',
              assessmentState: 'endedDueToFinalization',
            },
          };
        });

        test('should display the rejected assessment result status with the right color', async function (assert) {
          // given
          this.model = createCertificationCourseDetailsRecord(certificationCourseDetailsRecord);

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          const assessmentResultStatusElement = screen.getByText(
            this.intl.t('pages.certifications.certification.details.v3.assessment-result-status.rejected'),
          );

          assert.dom(assessmentResultStatusElement).exists();
          assert.true(assessmentResultStatusElement.classList.contains('pix-tag--error'));
        });

        test('should display the date of completion', async function (assert) {
          // given
          this.model = createCertificationCourseDetailsRecord(certificationCourseDetailsRecord);

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          const endedAtLabel = this.intl.t(
            'pages.certifications.certification.details.v3.general-informations.labels.ended-at',
          );

          assert.dom(screen.getByText(`${endedAtLabel} :`)).exists();
        });

        test('should display the ended by info or the abort reason', async function (assert) {
          // given
          this.model = createCertificationCourseDetailsRecord(certificationCourseDetailsRecord);

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          const endedAtLabel = this.intl.t(
            'pages.certifications.certification.details.v3.general-informations.labels.ended-by',
          );

          const abortReasonLabel = this.intl.t(
            'pages.certifications.certification.details.v3.general-informations.labels.abort-reason',
          );
          const abortReasonTranslation = this.intl.t(
            'pages.certifications.certification.details.v3.abort-reason.candidate',
          );
          const abortReasonElement = screen.getByLabelText(`${abortReasonLabel} :`);

          assert.dom(screen.getByLabelText(`${endedAtLabel} :`)).exists();
          assert.strictEqual(abortReasonElement.innerText, abortReasonTranslation);
        });
      });
    });

    module('certification "more informations" section', function () {
      test('displays the certification more informations section with the right info', async function (assert) {
        // given
        const certificationChallengesForAdministration = createChallengesForAdministration(
          ['ok', 'ok', 'ok', 'ok', 'ko', 'ko', 'ko', 'aband', 'aband', null],
          store,
        );
        this.model = createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store });

        // when
        const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);
        const expected = [
          {
            term: 'Nombre de question répondues\n/ Nombre total de questions',
            definition: '9/32',
          },
          {
            term: 'Nombre de question OK :',
            definition: '4',
          },
          {
            term: 'Nombre de question KO :',
            definition: '3',
          },
          {
            term: 'Nombre de question abandonnées :',
            definition: '2',
          },
          {
            term: 'Nombre de problèmes techniques validés :',
            definition: '1',
          },
        ];

        const list = screen.getByRole('list', {
          name: this.intl.t('pages.certifications.certification.details.v3.more-informations.title'),
        });
        const terms = within(list).getAllByRole('term');
        const definitions = within(list).getAllByRole('definition');
        const result = terms.map((term, i) => ({ term: term.innerText, definition: definitions[i].innerText }));

        // then
        assert.deepEqual(expected, result);
      });
    });

    module('questions list', function () {
      test('displays links to challenge info', async function (assert) {
        // given
        const certificationChallengesForAdministration = [
          store.createRecord('certification-challenges-for-administration', {
            id: 'rec1234',
            answerStatus: 'ok',
            validatedLiveAlert: null,
          }),
        ];
        this.model = createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store });

        // when
        const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

        // then
        assert
          .dom(
            screen.getByRole('link', {
              name: 'Lien vers les informations de la question (Ouverture dans une nouvelle fenêtre)',
            }),
          )
          .hasAttribute('href', 'https://editor.pix.fr/challenge/rec1234');
      });

      test('displays the table with every questions asked during certification', async function (assert) {
        // given
        const certificationChallengesForAdministration = createDetailedAnswers(answers, store);
        this.model = createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store });

        // when
        const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

        // then
        assert.dom(screen.getByRole('heading', { name: 'Liste des questions' })).exists();

        const linesWithResults = screen.getAllByRole('row').slice(1);
        assert.strictEqual(linesWithResults.length, 4);

        const result = [];

        linesWithResults.forEach((lineElement) => {
          const line = _getAllCellsButAction(lineElement);
          result.push(line.map((cell) => cell.innerText));
        });

        const expected = answers.map((answer) => [
          answer.questionNumber,
          `${answer.answeredAt.getHours()}:${answer.answeredAt.getMinutes()}:00`,
          answer.answerStatusName,
          `${answer.competenceIndex} ${answer.competenceName}`,
          answer.skillName,
          `${answer.id.toString()} `,
        ]);
        assert.deepEqual(expected, result);
      });

      module('when the candidate answers several questions', function () {
        module('when the candidate gives an answer to the question', function () {
          test('displays the modal with the candidate answer on icon click', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            this.model = store.createRecord('v3-certification-course-details-for-administration', {
              certificationChallengesForAdministration: createChallengesForAdministration(['ok', 'ko'], store),
            });

            // when
            const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

            const modalButtons = screen.getAllByRole('button', { name: 'Afficher la réponse du candidat' });
            await click(modalButtons[0]);

            // then
            const modal = within(await screen.findByRole('dialog'));
            assert.dom(modal.getByRole('heading', { name: 'Réponse question 1' })).exists();
            assert.dom(screen.getByText('Réponse 1')).exists();
          });
        });

        module('when the candidate skips the question', function () {
          test('does not display the answer icon', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            this.model = store.createRecord('v3-certification-course-details-for-administration', {
              certificationChallengesForAdministration: [
                store.createRecord('certification-challenges-for-administration', {
                  id: 1,
                  questionNumber: 1,
                  answerStatus: 'aband',
                }),
              ],
            });

            // when
            const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

            // then
            assert.dom(screen.queryByRole('button', { name: 'Afficher la réponse du candidat' })).doesNotExist();
          });
        });
      });

      test('should not display the issue report button', async function (assert) {
        // given
        const certificationChallengesForAdministration = createChallengesForAdministration(['ok'], store);
        this.model = createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store });

        // when
        const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Afficher le signalement de la question' })).doesNotExist();
      });

      module('when there is a reported question (question without an answer)', function () {
        test('should not display the response button', async function (assert) {
          // given
          const certificationChallengesForAdministration = createChallengesForAdministration([null], store);
          this.model = createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store });

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Afficher la réponse du candidat' })).doesNotExist();
        });

        test('displays the modal with the issue report subcategory', async function (assert) {
          // given
          const certificationChallengesForAdministration = createChallengesForAdministration(['ok', null], store);
          this.model = createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store });

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          const modalButton = screen.getByRole('button', { name: 'Afficher le signalement de la question' });
          await click(modalButton);

          // then
          const modal = within(await screen.findByRole('dialog'));
          assert.dom(modal.getByRole('heading', { name: 'Signalement question 2' })).exists();
          assert.dom(screen.getByText('E5')).exists();
          assert
            .dom(
              screen.getByText(
                "Le site est bloqué par les restrictions réseau de l'établissement (réseaux sociaux par ex.)",
              ),
            )
            .exists();
        });
      });

      module('when the candidate does not finish the session', function () {
        test('should not display a tag and a response icon in the last question line', async function (assert) {
          // given
          const certificationChallengesForAdministration = [
            store.createRecord('certification-challenges-for-administration', {
              validatedLiveAlert: false,
              answeredAt: null,
              answerStatus: null,
            }),
          ];
          this.model = createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store });

          // when
          const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

          // then
          const detailTable = screen.getByRole('table');
          const statusCellIndex = within(detailTable).getByRole('columnheader', { name: 'Statut' }).cellIndex;
          const lastQuestionDetail = within(detailTable).getAllByRole('row').at(-1);
          const lastQuestionStatus = within(lastQuestionDetail).getAllByRole('cell')[statusCellIndex - 1].innerText;
          assert.strictEqual(lastQuestionStatus, '-');
          assert.dom(screen.queryByRole('button', { name: 'Afficher la réponse du candidat' })).doesNotExist();
        });
      });
    });
  });
});

function createCertificationCourseDetailsRecord({ certificationChallengesForAdministration, store, params }) {
  return store.createRecord('v3-certification-course-details-for-administration', {
    assessmentState: 'completed',
    completedAt: new Date(),
    assessmentResultStatus: 'validated',
    certificationChallengesForAdministration,
    ...params,
  });
}

function createChallengesForAdministration(answerStatuses, store) {
  return answerStatuses.map((answerStatus, index) =>
    store.createRecord('certification-challenges-for-administration', {
      id: index,
      questionNumber: index + 1,
      answerStatus,
      answerValue: answerStatus ? `Réponse ${index + 1}` : null,
      validatedLiveAlert: !answerStatus ? { id: index + 10, issueReportSubcategory: 'WEBSITE_BLOCKED' } : false,
    }),
  );
}

function createDetailedAnswers(answers, store) {
  return answers.map((answer) => store.createRecord('certification-challenges-for-administration', answer));
}

function _getAllCellsButAction(lineElement) {
  const line = within(lineElement).getAllByRole('cell');
  line.splice(-1);
  return line;
}
