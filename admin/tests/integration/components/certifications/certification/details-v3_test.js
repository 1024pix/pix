import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';

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
  setupRenderingTest(hooks);

  module('#display', function () {
    test('displays the certification complementary info section with the right info', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.model = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(
          ['ok', 'ok', 'ok', 'ok', 'ko', 'ko', 'ko', 'aband', 'aband', null],
          store,
        ),
      });

      // when
      const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);
      const expected = [
        {
          term: 'Nombre de question répondues  / Nombre total de questions',
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

      const terms = screen.getAllByRole('term');
      const definitions = screen.getAllByRole('definition');
      const result = terms.map((term, i) => ({ term: term.textContent, definition: definitions[i].textContent }));

      // then
      assert.deepEqual(expected, result);
    });

    test('displays links to challenge info', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.model = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: [
          store.createRecord('certification-challenges-for-administration', {
            id: 'rec1234',
            answerStatus: 'ok',
            validatedLiveAlert: null,
          }),
        ],
      });

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
      const store = this.owner.lookup('service:store');
      this.model = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createDetailedAnswers(answers, store),
      });

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
      const store = this.owner.lookup('service:store');
      this.model = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(['ok'], store),
      });

      // when
      const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Afficher le signalement de la question' })).doesNotExist();
    });

    module('when there is a reported question (question without an answer)', function () {
      test('should not display the response button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.model = store.createRecord('v3-certification-course-details-for-administration', {
          certificationChallengesForAdministration: createChallengesForAdministration([null], store),
        });

        // when
        const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Afficher la réponse du candidat' })).doesNotExist();
      });

      test('displays the modal with the issue report subcategory', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.model = store.createRecord('v3-certification-course-details-for-administration', {
          certificationChallengesForAdministration: createChallengesForAdministration(['ok', null], store),
        });

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
        const store = this.owner.lookup('service:store');
        this.model = store.createRecord('v3-certification-course-details-for-administration', {
          certificationChallengesForAdministration: [
            store.createRecord('certification-challenges-for-administration', {
              validatedLiveAlert: false,
              answeredAt: null,
              answerStatus: null,
            }),
          ],
        });

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
