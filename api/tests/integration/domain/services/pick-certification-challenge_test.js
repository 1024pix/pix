const { expect, databaseBuilder, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const placementProfileService = require('../../../../lib/domain/services/placement-profile-service');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const moment = require('moment');
const { PIX_COUNT_BY_LEVEL } = require('../../../../lib/domain/constants');

describe('Integration | CertificationChallengeService | pickCertificationChallenge', function() {
  const placementDate = new Date('2020-01-01T00:00:00Z');
  const certificationDate = _addOneDayToDate(placementDate);
  const sufficientPixValueToBeCertifiableOnCompetence = PIX_COUNT_BY_LEVEL;
  const unsufficientPixValueToBeCertifiableOnCompetence = 1;
  let certifiableUserId;

  beforeEach(() => {
    certifiableUserId = databaseBuilder.factory.buildUser().id;
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  it('picks only operative challenges', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@recArea1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: '', // unoperative
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill2',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill2_Challenge1',
                        statut: 'validé', // operative
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill2',
      challengeId: 'recArea1_Competence1_Tube1_Skill2_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

    //then
    expect(challenges.map((challenge) => challenge.challengeId)).to.deep.equal(['recArea1_Competence1_Tube1_Skill2_Challenge1']);
  });

  it('picks only fr-fr challenges', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@recArea1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Anglais', 'Français'],
                      },
                    ],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill2',
                    nom: '@recArea1_Competence1_Tube1_Skill2',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill2_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill2',
      challengeId: 'recArea1_Competence1_Tube1_Skill2_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await databaseBuilder.commit();
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

    //then
    expect(challenges.map((challenge) => challenge.challengeId)).to.deep.equal(['recArea1_Competence1_Tube1_Skill2_Challenge1']);
  });

  it('picks challenges on certifiable competences only', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@recArea1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recArea1_Competence2',
            tubes: [
              {
                id: 'recArea1_Competence2_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence2_Tube1_Skill1',
                    nom: '@recArea1_Competence2_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence2_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      pixValue: unsufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence2',
      skillId: 'recArea1_Competence2_Tube1_Skill1',
      challengeId: 'recArea1_Competence2_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

    //then
    expect(challenges.map((challenge) => challenge.challengeId)).to.deep.equal(['recArea1_Competence2_Tube1_Skill1_Challenge1']);
  });

  it('picks challenges on Pix competences only', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            origin: 'Pix+', // Non-pix
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@recArea1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recArea1_Competence2',
            origin: 'Pix',
            tubes: [
              {
                id: 'recArea1_Competence2_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence2_Tube1_Skill1',
                    nom: '@recArea1_Competence2_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence2_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence2',
      skillId: 'recArea1_Competence2_Tube1_Skill1',
      challengeId: 'recArea1_Competence2_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

    //then
    expect(challenges.map((challenge) => challenge.challengeId)).to.deep.equal(['recArea1_Competence2_Tube1_Skill1_Challenge1']);
  });

  it('picks one skill-related challenge, starting by unanswered challenges first', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@recArea1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge2',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge3',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);
    expect(challenges.length).to.equal(1);
    expect(challenges[0].challengeId).to.be.oneOf(['recArea1_Competence1_Tube1_Skill1_Challenge2', 'recArea1_Competence1_Tube1_Skill1_Challenge3']);
  });

  it('picks one skill-related challenge, falling back on already answered challenges if no unanswered one is available', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@recArea1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge2',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge3',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill2',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge2',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill3',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge3',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });

    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);
    expect(challenges.length).to.equal(1);
    expect(['recArea1_Competence1_Tube1_Skill1_Challenge1', 'recArea1_Competence1_Tube1_Skill1_Challenge2', 'recArea1_Competence1_Tube1_Skill1_Challenge3']).to.include(challenges[0].challengeId);
  });

  it('picks one challenge by skill to a maximum of 3 challenges by competence starting by most difficult skills', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@area1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill2',
                    nom: '@area1_Competence1_Tube1_Skill2',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill2_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill3',
                    nom: '@area1_Competence1_Tube1_Skill3',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill3_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill4',
                    nom: '@area1_Competence1_Tube1_Skill4',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill4_Challenge1',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill2',
      challengeId: 'recArea1_Competence1_Tube1_Skill2_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill3',
      challengeId: 'recArea1_Competence1_Tube1_Skill3_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill4',
      challengeId: 'recArea1_Competence1_Tube1_Skill4_Challenge1',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await databaseBuilder.commit();
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);
    expect(challenges.length).to.equal(3);
    expect(challenges.map((challenge) => challenge.challengeId)).to.deep.equal(
      [
        'recArea1_Competence1_Tube1_Skill4_Challenge1',
        'recArea1_Competence1_Tube1_Skill3_Challenge1',
        'recArea1_Competence1_Tube1_Skill2_Challenge1',
      ],
    );
  });

  it('picks the same challenge only once even if it is related to two different skills (QROCmDep)', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [
              {
                id: 'recArea1_Competence1_Tube1',
                skills: [
                  {
                    id: 'recArea1_Competence1_Tube1_Skill1',
                    nom: '@area1_Competence1_Tube1_Skill1',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_And_Skill2_Challenge',
                        statut: 'validé',
                        langues: ['Franco Français'],
                      },
                    ],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill2',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_And_Skill2_Challenge', // same id
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill1',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_And_Skill2_Challenge',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    await _buildCorrectAnswerAndKnowledgeElement({
      userId: certifiableUserId,
      competenceId: 'recArea1_Competence1',
      skillId: 'recArea1_Competence1_Tube1_Skill2',
      challengeId: 'recArea1_Competence1_Tube1_Skill1_And_Skill2_Challenge',
      pixValue: sufficientPixValueToBeCertifiableOnCompetence,
      acquisitionDate: placementDate,
    });
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: certifiableUserId,
      limitDate: certificationDate,
    });

    // when
    const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);
    expect(challenges.length).to.equal(1);
    expect(challenges[0].challengeId).to.equal('recArea1_Competence1_Tube1_Skill1_And_Skill2_Challenge');
  });
});

async function _buildCorrectAnswerAndKnowledgeElement({
  userId,
  competenceId,
  challengeId,
  pixValue,
  acquisitionDate,
  skillId,
}) {
  const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
  const answerId = databaseBuilder.factory.buildAnswer({
    assessmentId,
    challengeId,
  }).id;
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    assessmentId,
    earnedPix: pixValue,
    competenceId,
    answerId,
    createdAt: acquisitionDate,
    skillId,
  });
  await databaseBuilder.commit();
}

function _addOneDayToDate(date) {
  return moment(date).add(1, 'day').toDate();
}
