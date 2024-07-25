import { ABORT_REASONS } from '../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { AnswerStatus, Assessment } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | Session | session-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /sessions/{id}/finalization', function () {
    describe('when session is v3', function () {
      describe('when the candidate has not answered all the questions', function () {
        it('should downgrade the pix score', async function () {
          // given
          const learningContent = _buildLearningContentWithEnoughChallenges();

          const difficulties = _getChallengeDifficulties(learningContent);

          const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
          mockLearningContent(learningContentObjects);

          const userId = databaseBuilder.factory.buildUser({ id: 123 }).id;
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
            isV3Pilot: true,
          }).id;
          const session = databaseBuilder.factory.buildSession({ version: 3, certificationCenterId });
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId,
            certificationCenterId,
          });

          const configurationCreatorId = databaseBuilder.factory.buildUser().id;

          databaseBuilder.factory.buildCompetenceScoringConfiguration({
            createdByUserId: configurationCreatorId,
            configuration: _createCompetenceScoringConfiguration(),
          });

          databaseBuilder.factory.buildScoringConfiguration();

          databaseBuilder.factory.buildFlashAlgorithmConfiguration({
            warmUpLength: null,
            forcedCompetences: [],
            maximumAssessmentLength: 32,
            challengesBetweenSameCompetence: null,
            minimumEstimatedSuccessRateRanges: [],
            limitToOneQuestionPerTube: false,
            enablePassageByAllCompetences: true,
            doubleMeasuresUntil: null,
            variationPercent: 0.5,
            variationPercentUntil: null,
            createdAt: new Date(),
          });

          const userIdForCompletedAssessment = databaseBuilder.factory.buildUser({ id: 789 }).id;
          const userIdForUncompletedAssessment = databaseBuilder.factory.buildUser({ id: 101112 }).id;

          const unfinishedCertificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            completedAt: null,
            version: 3,
            userId: userIdForUncompletedAssessment,
            abortReason: ABORT_REASONS.CANDIDATE,
          }).id;

          const finishedCertificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            completedAt: null,
            version: 3,
            userId: userIdForCompletedAssessment,
            abortReason: null,
          }).id;

          const reportForUnfinishedCourse = databaseBuilder.factory.buildCertificationReport({
            certificationCourseId: unfinishedCertificationCourseId,
            sessionId: session.id,
            abortReason: ABORT_REASONS.CANDIDATE,
          });

          const finishedAssessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: finishedCertificationCourseId,
            state: Assessment.states.STARTED,
            userId: userIdForCompletedAssessment,
          }).id;

          const unfinishedAssessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: unfinishedCertificationCourseId,
            state: Assessment.states.STARTED,
            userId: userIdForUncompletedAssessment,
          }).id;

          await _buildChallengeAndAnswerForFinishedCourseWithLastFivePassedChallenges({
            assessmentId: finishedAssessmentId,
            certificationCourseId: finishedCertificationCourseId,
            difficulties,
          });

          await _buildChallengeAndAnswerForUnFinishedCourseWithoutLastFiveChallenges({
            assessmentId: unfinishedAssessmentId,
            certificationCourseId: unfinishedCertificationCourseId,
            difficulties,
          });

          await databaseBuilder.commit();

          const optionsForCompletedAssessment = {
            method: 'PATCH',
            url: `/api/assessments/${finishedAssessmentId}/complete-assessment`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userIdForCompletedAssessment),
            },
          };

          const optionsForUncompletedAssessment = {
            method: 'PUT',
            payload: {
              data: {
                attributes: {
                  'examiner-global-comment': '',
                  'has-incident': true,
                  'has-joining-issue': true,
                },
                included: [
                  {
                    id: reportForUnfinishedCourse.id,
                    type: 'certification-reports',
                    attributes: {
                      'certification-course-id': reportForUnfinishedCourse.certificationCourseId,
                      'examiner-comment': 'What a fine lad this one',
                      'has-seen-end-test-screen': true,
                      'is-completed': true,
                      'abort-reason': ABORT_REASONS.CANDIDATE,
                    },
                  },
                ],
              },
            },
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
            url: `/api/sessions/${session.id}/finalization`,
          };

          // when
          await server.inject(optionsForCompletedAssessment);
          await server.inject(optionsForUncompletedAssessment);

          // then
          const assessmentResultForFinishedCertification = await knex('assessment-results')
            .where({ assessmentId: finishedAssessmentId })
            .orderBy('createdAt', 'desc')
            .first();
          const assessmentResultForUnfinishedCertification = await knex('assessment-results')
            .where({ assessmentId: unfinishedAssessmentId })
            .orderBy('createdAt', 'desc')
            .first();

          expect(assessmentResultForFinishedCertification.pixScore).to.equal(
            assessmentResultForUnfinishedCertification.pixScore,
            1,
          );
        });
      });
    });
  });
});

const _buildChallengeAndAnswerForFinishedCourseWithLastFivePassedChallenges = async ({
  certificationCourseId,
  assessmentId,
  difficulties,
}) => {
  for (let index = 1; index < 28; index++) {
    const certificationChallenge = await databaseBuilder.factory.buildCertificationChallenge({
      courseId: certificationCourseId,
      challengeId: `recChallenge${index}`,
      difficulty: difficulties[index - 1],
      discriminant: 1.5,
    });

    databaseBuilder.factory.buildAnswer({
      assessmentId,
      challengeId: certificationChallenge.challengeId,
      result: index % 2 === 0 ? AnswerStatus.OK.status : AnswerStatus.KO.status,
    });
  }

  for (let index = 28; index <= 32; index++) {
    const certificationChallenge = await databaseBuilder.factory.buildCertificationChallenge({
      courseId: certificationCourseId,
      challengeId: `recChallenge${index}`,
      difficulty: difficulties[index - 1],
      discriminant: 1.5,
    });

    databaseBuilder.factory.buildAnswer({
      assessmentId,
      challengeId: certificationChallenge.challengeId,
      result: AnswerStatus.SKIPPED.status,
    });
  }
};

const _buildChallengeAndAnswerForUnFinishedCourseWithoutLastFiveChallenges = async ({
  certificationCourseId,
  assessmentId,
  difficulties,
}) => {
  for (let index = 1; index < 28; index++) {
    const certificationChallenge = await databaseBuilder.factory.buildCertificationChallenge({
      courseId: certificationCourseId,
      challengeId: `recChallenge${index}`,
      difficulty: difficulties[index - 1],
      discriminant: 1.5,
    });

    databaseBuilder.factory.buildAnswer({
      assessmentId,
      challengeId: certificationChallenge.challengeId,
      result: index % 2 === 0 ? AnswerStatus.OK.status : AnswerStatus.KO.status,
    });
  }
};

function _getChallengeDifficulties(learningContent) {
  return learningContent.flatMap((area) => {
    return area.competences.flatMap((competence) => {
      return competence.tubes.flatMap((tube) => {
        return tube.skills.flatMap((skill) => {
          return skill.challenges.flatMap((challenge) => {
            return challenge.delta;
          });
        });
      });
    });
  });
}

function _createCompetenceScoringConfiguration() {
  const competenceIndexes = [
    '1.1',
    '1.2',
    '1.3',
    '2.1',
    '2.2',
    '2.3',
    '2.4',
    '3.1',
    '3.2',
    '3.3',
    '3.4',
    '4.1',
    '4.2',
    '4.3',
    '5.1',
    '5.2',
  ];

  return competenceIndexes.map((competenceIndex) => {
    return {
      values: [
        {
          bounds: { max: -1, min: -5 },
          competenceLevel: 0,
        },
        {
          bounds: { max: -0.7, min: -1 },
          competenceLevel: 1,
        },
        {
          bounds: { max: 0, min: -0.7 },
          competenceLevel: 2,
        },
        {
          bounds: { max: 0.7, min: 0 },
          competenceLevel: 3,
        },
        {
          bounds: { max: 2, min: 0.7 },
          competenceLevel: 4,
        },
        {
          bounds: { max: 2.9, min: 2 },
          competenceLevel: 5,
        },
        {
          bounds: { max: 4, min: 2.9 },
          competenceLevel: 6,
        },
        { bounds: { max: 6.8, min: 4 }, competenceLevel: 7 },
      ],
      competence: competenceIndex,
    };
  });
}

function _buildLearningContentWithEnoughChallenges() {
  return [
    {
      id: 'recArea1',
      code: '1',
      competences: [
        {
          index: '1.1',
          id: 'recCompetence1',
          tubes: [
            {
              id: 'recTube1_0',
              skills: [
                {
                  id: 'recSkill1_0',
                  nom: '@recSkill1_0',
                  challenges: [
                    {
                      id: 'recChallenge1',
                      delta: -1,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill1_1',
                  nom: '@recSkill1_1',
                  challenges: [
                    {
                      id: 'recChallenge2',
                      delta: -0.5,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence2',
          index: '1.2',
          tubes: [
            {
              id: 'recTube2_0',
              skills: [
                {
                  id: 'recSkill2_0',
                  nom: '@recSkill2_0',
                  challenges: [
                    {
                      id: 'recChallenge3',
                      delta: -1,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill2_1',
                  nom: '@recSkill2_1',
                  challenges: [
                    {
                      id: 'recChallenge4',
                      delta: 0,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
                },
              ],
            },
          ],
        },
        {
          id: 'recCompetence3',
          index: '1.3',
          tubes: [
            {
              id: 'recTube3_0',
              skills: [
                {
                  id: 'recSkill3_0',
                  nom: '@recSkill3_0',
                  challenges: [
                    {
                      id: 'recChallenge5',
                      delta: 0.5,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill3_1',
                  nom: '@recSkill3_1',
                  challenges: [
                    {
                      id: 'recChallenge6',
                      delta: 0.8,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea2',
      code: '2',
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
                  challenges: [
                    {
                      id: 'recChallenge7',
                      delta: 1.1,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill4_1',
                  nom: '@recSkill4_1',
                  challenges: [
                    {
                      id: 'recChallenge8',
                      delta: 1.4,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill5_0',
                  nom: '@recSkill5_0',
                  challenges: [
                    {
                      id: 'recChallenge9',
                      delta: 1.6,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill5_1',
                  nom: '@recSkill5_1',
                  challenges: [
                    {
                      id: 'recChallenge10',
                      delta: 1.8,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill6_0',
                  nom: '@recSkill6_0',
                  challenges: [
                    {
                      id: 'recChallenge11',
                      delta: 2.1,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill6_1',
                  nom: '@recSkill6_1',
                  challenges: [
                    {
                      id: 'recChallenge12',
                      delta: 2.3,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill7_0',
                  nom: '@recSkill7_0',
                  challenges: [
                    {
                      id: 'recChallenge13',
                      delta: 2.5,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill7_1',
                  nom: '@recSkill7_1',
                  challenges: [
                    {
                      id: 'recChallenge14',
                      delta: 2.7,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea3',
      code: '3',
      competences: [
        {
          id: 'recCompetence8',
          index: '3.1',
          tubes: [
            {
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill8_0',
                  nom: '@recSkill8_0',
                  challenges: [
                    {
                      id: 'recChallenge15',
                      delta: 3,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill8_1',
                  nom: '@recSkill8_1',
                  challenges: [
                    {
                      id: 'recChallenge16',
                      delta: 3.2,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill9_0',
                  nom: '@recSkill9_0',
                  challenges: [
                    {
                      id: 'recChallenge17',
                      delta: 3.4,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill9_1',
                  nom: '@recSkill9_1',
                  challenges: [
                    {
                      id: 'recChallenge18',
                      delta: 3.6,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill10_0',
                  nom: '@recSkill10_0',
                  challenges: [
                    {
                      id: 'recChallenge19',
                      delta: 3.8,
                      alpha: 1.5,
                    },
                  ],
                  level: 0,
                },
                {
                  id: 'recSkill10_1',
                  nom: '@recSkill10_1',
                  challenges: [
                    {
                      id: 'recChallenge20',
                      delta: 4,
                      alpha: 1.5,
                    },
                  ],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill11_0',
                  nom: '@recSkill11_0',
                  challenges: [{ id: 'recChallenge21', delta: 4.2, alpha: 1.5 }],
                  level: 0,
                },
                {
                  id: 'recSkill11_1',
                  nom: '@recSkill11_1',
                  challenges: [{ id: 'recChallenge22', delta: 4.4, alpha: 1.5 }],
                  level: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea4',
      code: '4',
      competences: [
        {
          id: 'recCompetence12',
          index: '4.1',
          tubes: [
            {
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill12_0',
                  nom: '@recSkill12_0',
                  challenges: [{ id: 'recChallenge23', delta: 4.2, alpha: 1.5 }],
                  level: 0,
                },
                {
                  id: 'recSkill12_1',
                  nom: '@recSkill12_1',
                  challenges: [{ id: 'recChallenge24', delta: 4, alpha: 1.5 }],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill13_0',
                  nom: '@recSkill13_0',
                  challenges: [{ id: 'recChallenge25', delta: 3.7, alpha: 1.5 }],
                  level: 0,
                },
                {
                  id: 'recSkill13_1',
                  nom: '@recSkill13_1',
                  challenges: [{ id: 'recChallenge26', delta: 3.4, alpha: 1.5 }],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill14_0',
                  nom: '@recSkill14_0',
                  challenges: [{ id: 'recChallenge27', delta: 3.2, alpha: 1.5 }],
                  level: 0,
                },
                {
                  id: 'recSkill14_1',
                  nom: '@recSkill14_1',
                  challenges: [{ id: 'recChallenge28', delta: 2.9, alpha: 1.5 }],
                  level: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'recArea5',
      code: '5',
      competences: [
        {
          id: 'recCompetence15',
          index: '5.1',
          tubes: [
            {
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill15_0',
                  nom: '@recSkill15_0',
                  challenges: [{ id: 'recChallenge29', delta: 2.5, alpha: 1.5 }],
                  level: 0,
                },
                {
                  id: 'recSkill15_1',
                  nom: '@recSkill15_1',
                  challenges: [{ id: 'recChallenge30', delta: 2.2, alpha: 1.5 }],
                  level: 1,
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
              id: 'recTube0_0',
              skills: [
                {
                  id: 'recSkill16_0',
                  nom: '@recSkill16_0',
                  challenges: [{ id: 'recChallenge31', delta: 2, alpha: 1.5 }],
                  level: 0,
                },
                {
                  id: 'recSkill16_1',
                  nom: '@recSkill16_1',
                  challenges: [{ id: 'recChallenge32', delta: 1.6, alpha: 1.5 }],
                  level: 1,
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}
