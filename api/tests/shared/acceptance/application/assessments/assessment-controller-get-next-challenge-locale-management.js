import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { FRENCH_FRANCE } from '../../../../../src/shared/domain/services/locale-service.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

const competenceId = 'recCompetence';
const frenchSpokenChallengeId = 'recFrenchSpokenChallengeId';
const frenchChallengeId = 'recFrenchChallengeId';

const learningContent = [
  {
    id: 'recArea0',
    competences: [
      {
        id: competenceId,
        titreFrFr: 'Mener une recherche et une veille d’information',
        index: '1.1',
        tubes: [
          {
            id: 'recTube0_0',
            skills: [
              {
                id: 'skillWeb1',
                nom: '@skillWeb1',
                challenges: [],
                level: 1,
              },
              {
                id: 'skillWeb2',
                nom: '@skillWeb2',
                challenges: [
                  { id: frenchChallengeId, langues: ['Franco Français'] },
                  { id: frenchSpokenChallengeId, langues: ['Francophone'] },
                ],
                level: 2,
              },
              {
                id: 'skillWeb3',
                nom: '@skillWeb3',
                challenges: [],
                level: 3,
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Acceptance | API | assessment-controller-get-next-challenge-locale-management', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/assessments/:assessment_id', function () {
    const assessmentId = 1;
    const userId = 1234;

    context('when assessment is a competence evaluation', function () {
      context('when there is one challenge in the accepted language (fr-fr)', function () {
        beforeEach(async function () {
          const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
          await mockLearningContent(learningContentObjects);

          databaseBuilder.factory.buildUser({ id: userId });
          databaseBuilder.factory.buildAssessment({
            id: assessmentId,
            type: Assessment.types.COMPETENCE_EVALUATION,
            userId,
            competenceId,
          });
          databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
          await databaseBuilder.commit();
        });

        it('should return the challenge in the accepted language (fr-fr)', function () {
          // given
          const options = {
            method: 'GET',
            url: `/api/assessments/${assessmentId}`,
            headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_FRANCE }),
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.result.data.id).to.equal(frenchChallengeId);
          });
        });
      });
    });
  });
});
