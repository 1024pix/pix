import _ from 'lodash';

import { CertificationCompletedJobController } from '../../../../../../src/certification/evaluation/application/jobs/certification-completed-job-controller.js';
import { CertificationCompletedJob } from '../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { Assessment } from '../../../../../../src/shared/domain/models/index.js';
import { FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import {
  databaseBuilder,
  expect,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../../test-helper.js';

describe('Integration | Certification | Application | jobs | CertificationCompletedJobController', function () {
  let certificationCompletedJobController;
  const easyChallengeParams = {
    alpha: 1,
    delta: -3,
    langues: ['Franco Français'],
  };
  const hardChallengeParams = {
    alpha: 1,
    delta: 3,
    langues: ['Franco Français'],
  };
  const learningContent = [
    {
      id: 'recArea0',
      code: 'area0',
      competences: [
        {
          id: 'recCompetence0',
          index: '1.1',
          tubes: [
            {
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill0_0',
                  nom: '@recSkill0_0',
                  level: 2,
                  challenges: [{ id: 'recChallenge0_0_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill0_1',
                  nom: '@recSkill0_1',
                  challenges: [{ id: 'recChallenge0_1_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill0_2',
                  nom: '@recSkill0_2',
                  challenges: [{ id: 'recChallenge0_2_0', ...hardChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence1',
          index: '1.2',
          tubes: [
            {
              id: 'recTube1_0',
              skills: [
                {
                  id: 'recSkill1_0',
                  nom: '@recSkill1_0',
                  challenges: [{ id: 'recChallenge1_0_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill1_1',
                  nom: '@recSkill1_1',
                  challenges: [{ id: 'recChallenge1_1_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill1_2',
                  nom: '@recSkill1_2',
                  challenges: [{ id: 'recChallenge1_2_0', ...hardChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence2',
          index: '1.3',
          tubes: [
            {
              id: 'recTube2_0',
              skills: [
                {
                  id: 'recSkill2_0',
                  nom: '@recSkill2_0',
                  challenges: [{ id: 'recChallenge2_0_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill2_1',
                  nom: '@recSkill2_1',
                  challenges: [{ id: 'recChallenge2_1_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill2_2',
                  nom: '@recSkill2_2',
                  challenges: [{ id: 'recChallenge2_2_0', ...hardChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence3',
          index: '1.4',
          tubes: [
            {
              id: 'recTube3_0',
              skills: [
                {
                  id: 'recSkill3_0',
                  nom: '@recSkill3_0',
                  challenges: [{ id: 'recChallenge3_0_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill3_1',
                  nom: '@recSkill3_1',
                  challenges: [{ id: 'recChallenge3_1_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill3_2',
                  nom: '@recSkill3_2',
                  challenges: [{ id: 'recChallenge3_2_0', ...hardChallengeParams }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea1',
      code: 'area1',
      competences: [
        {
          id: 'recCompetence4',
          index: '2.1',
          tubes: [
            {
              id: 'recTube4_0',
              skills: [
                {
                  id: 'recSkill4_0',
                  nom: '@recSkill4_0',
                  challenges: [{ id: 'recChallenge4_0_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill4_1',
                  nom: '@recSkill4_1',
                  challenges: [{ id: 'recChallenge4_1_0', ...easyChallengeParams }],
                },
                {
                  id: 'recSkill4_2',
                  nom: '@recSkill4_2',
                  challenges: [{ id: 'recChallenge4_2_0', ...hardChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence5',
          index: '2.2',
          tubes: [
            {
              id: 'recTube5_0',
              skills: [
                {
                  id: 'recSkill5_0',
                  nom: '@recSkill5_0',
                  challenges: [{ id: 'recChallenge5_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence6',
          index: '2.3',
          tubes: [
            {
              id: 'recTube6_0',
              skills: [
                {
                  id: 'recSkill6_0',
                  nom: '@recSkill6_0',
                  challenges: [{ id: 'recChallenge6_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence7',
          index: '2.4',
          tubes: [
            {
              id: 'recTube7_0',
              skills: [
                {
                  id: 'recSkill7_0',
                  nom: '@recSkill7_0',
                  challenges: [{ id: 'recChallenge7_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea2',
      code: 'area2',
      competences: [
        {
          id: 'recCompetence8',
          index: '3.1',
          tubes: [
            {
              id: 'recTube8_0',
              skills: [
                {
                  id: 'recSkill8_0',
                  nom: '@recSkill8_0',
                  challenges: [{ id: 'recChallenge8_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence9',
          index: '3.2',
          tubes: [
            {
              id: 'recTube9_0',
              skills: [
                {
                  id: 'recSkill9_0',
                  nom: '@recSkill9_0',
                  challenges: [{ id: 'recChallenge9_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence10',
          index: '3.3',
          tubes: [
            {
              id: 'recTube10_0',
              skills: [
                {
                  id: 'recSkill10_0',
                  nom: '@recSkill10_0',
                  challenges: [{ id: 'recChallenge10_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence11',
          index: '3.4',
          tubes: [
            {
              id: 'recTube11_0',
              skills: [
                {
                  id: 'recSkill11_0',
                  nom: '@recSkill11_0',
                  challenges: [{ id: 'recChallenge11_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea3',
      code: 'area3',
      competences: [
        {
          id: 'recCompetence12',
          index: '4.1',
          tubes: [
            {
              id: 'recTube12_0',
              skills: [
                {
                  id: 'recSkill12_0',
                  nom: '@recSkill12_0',
                  challenges: [{ id: 'recChallenge12_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence13',
          index: '4.2',
          tubes: [
            {
              id: 'recTube13_0',
              skills: [
                {
                  id: 'recSkill13_0',
                  nom: '@recSkill13_0',
                  challenges: [{ id: 'recChallenge13_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence14',
          index: '4.3',
          tubes: [
            {
              id: 'recTube14_0',
              skills: [
                {
                  id: 'recSkill14_0',
                  nom: '@recSkill14_0',
                  challenges: [{ id: 'recChallenge14_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea4',
      code: 'area4',
      competences: [
        {
          id: 'recCompetence15',
          index: '5.1',
          tubes: [
            {
              id: 'recTube15_0',
              skills: [
                {
                  id: 'recSkill15_0',
                  nom: '@recSkill15_0',
                  challenges: [{ id: 'recChallenge15_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence16',
          index: '5.2',
          tubes: [
            {
              id: 'recTube16_0',
              skills: [
                {
                  id: 'recSkill16_0',
                  nom: '@recSkill16_0',
                  challenges: [{ id: 'recChallenge16_0_0', ...easyChallengeParams }],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  beforeEach(async function () {
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);

    certificationCompletedJobController = new CertificationCompletedJobController();

    const configurationCreatorId = databaseBuilder.factory.buildUser().id;

    databaseBuilder.factory.buildCompetenceScoringConfiguration({
      createdByUserId: configurationCreatorId,
      configuration: [
        {
          competence: '1.1',
          values: [
            {
              bounds: {
                max: 0,
                min: -5,
              },
              competenceLevel: 0,
            },
            {
              bounds: {
                max: 5,
                min: 0,
              },
              competenceLevel: 1,
            },
          ],
        },
      ],
    });
    databaseBuilder.factory.buildScoringConfiguration({ createdByUserId: configurationCreatorId });
    databaseBuilder.factory.buildFlashAlgorithmConfiguration();

    await databaseBuilder.commit();
  });

  describe('#handle', function () {
    context('when certification is v3', function () {
      describe('when user answers are normal', function () {
        it('should complete the certification assessment', async function () {
          // given
          const limitDate = new Date('2020-01-01T00:00:00Z');
          const certifiableUserId = databaseBuilder.factory.buildUser().id;

          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: certifiableUserId,
            createdAt: limitDate,
            version: 3,
          });

          databaseBuilder.factory.buildCertificationCandidate({
            userId: certifiableUserId,
            sessionId: certificationCourse.sessionId,
          });

          const certificationAssessment = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            userId: certifiableUserId,
            state: Assessment.states.STARTED,
            type: Assessment.types.CERTIFICATION,
            createdAt: limitDate,
          });

          _buildValidAnswersAndCertificationChallenges({
            assessmentId: certificationAssessment.id,
            certificationCourseId: certificationCourse.id,
          });

          await databaseBuilder.commit();

          const data = new CertificationCompletedJob({
            assessmentId: certificationAssessment.id,
            certificationCourseId: certificationCourse.id,
            userId: certifiableUserId,
            locale: FRENCH_FRANCE,
          });

          // when
          await certificationCompletedJobController.handle({ data });

          // then

          const assessmentResult = await knex('assessment-results')
            .where({
              assessmentId: certificationAssessment.id,
            })
            .first();

          expect(assessmentResult.pixScore).to.exist;
        });

        it('should register the certification challenge capacities', async function () {
          // given
          const limitDate = new Date('2020-01-01T00:00:00Z');
          const certifiableUserId = databaseBuilder.factory.buildUser().id;

          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: certifiableUserId,
            createdAt: limitDate,
            version: 3,
          });

          databaseBuilder.factory.buildCertificationCandidate({
            userId: certifiableUserId,
            sessionId: certificationCourse.sessionId,
          });

          const certificationAssessment = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            userId: certifiableUserId,
            state: Assessment.states.STARTED,
            type: Assessment.types.CERTIFICATION,
            createdAt: limitDate,
          });

          _buildValidAnswersAndCertificationChallenges({
            assessmentId: certificationAssessment.id,
            certificationCourseId: certificationCourse.id,
          });

          await databaseBuilder.commit();

          const data = new CertificationCompletedJob({
            assessmentId: certificationAssessment.id,
            certificationCourseId: certificationCourse.id,
            userId: certifiableUserId,
            locale: FRENCH_FRANCE,
          });

          // when
          await certificationCompletedJobController.handle({ data });

          // then
          const certificationChallengeCapacities = await knex('certification-challenge-capacities')
            .join(
              'certification-challenges',
              'certification-challenges.id',
              'certification-challenge-capacities.certificationChallengeId',
            )
            .where({
              courseId: certificationCourse.id,
            });

          expect(certificationChallengeCapacities).to.have.lengthOf(9);
        });

        describe('when user estimatedLevel is too high', function () {
          it('should complete the certification assessment', async function () {
            // given
            const limitDate = new Date('2020-01-01T00:00:00Z');
            const certifiableUserId = databaseBuilder.factory.buildUser().id;

            const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
              userId: certifiableUserId,
              createdAt: limitDate,
              version: 3,
            });

            databaseBuilder.factory.buildCertificationCandidate({
              userId: certifiableUserId,
              sessionId: certificationCourse.sessionId,
            });

            const certificationAssessment = databaseBuilder.factory.buildAssessment({
              certificationCourseId: certificationCourse.id,
              userId: certifiableUserId,
              state: Assessment.states.STARTED,
              type: Assessment.types.CERTIFICATION,
              createdAt: limitDate,
            });

            _buildValidAnswersAndCertificationChallenges({
              assessmentId: certificationAssessment.id,
              certificationCourseId: certificationCourse.id,
              difficulty: 9,
            });

            await databaseBuilder.commit();

            const data = new CertificationCompletedJob({
              assessmentId: certificationAssessment.id,
              certificationCourseId: certificationCourse.id,
              userId: certifiableUserId,
              locale: FRENCH_FRANCE,
            });

            // when
            await certificationCompletedJobController.handle({ data });

            // then

            const assessmentResult = await knex('assessment-results')
              .where({
                assessmentId: certificationAssessment.id,
              })
              .first();

            expect(assessmentResult.pixScore).to.exist;

            const competenceMarks = await knex('competence-marks')
              .where({
                assessmentResultId: assessmentResult.id,
              })
              .orderBy('competenceId');

            expect(competenceMarks).to.have.lengthOf(1);

            expect(competenceMarks[0].level).to.equal(1);
          });
        });
      });
    });
  });
});

function _buildValidAnswersAndCertificationChallenges({
  certificationCourseId,
  assessmentId,
  difficulty = 0,
  competenceId = 'recCompetence0',
}) {
  const answers = _.flatten(
    _.range(0, 3).map((skillIndex) =>
      _.range(0, 3).map((level) => {
        return databaseBuilder.factory.buildAnswer({
          challengeId: `recChallenge${skillIndex}_${level}_0`,
          result: 'ok',
          assessmentId: assessmentId,
        });
      }),
    ),
  );

  const certificationChallenges = answers.map(({ challengeId }) =>
    databaseBuilder.factory.buildCertificationChallenge({
      challengeId,
      competenceId,
      courseId: certificationCourseId,
      difficulty,
      discriminant: 2,
    }),
  );

  return {
    answers,
    certificationChallenges,
  };
}
