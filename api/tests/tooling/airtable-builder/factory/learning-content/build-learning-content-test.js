const { expect, airtableBuilder, mockLearningContent } = require('../../../../test-helper');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/area-datasource');
const competenceDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/competence-datasource');
const tubeDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/tube-datasource');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/challenge-datasource');

describe('Integration | buildLearningContent', () => {

  it('builds areas', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [],
      },
      {
        id: 'recArea2',
        competences: [],
      },
    ];

    // when
    const learningContentObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const areas = await areaDatasource.list();
    expect(areas[0].id).to.equal('recArea1');
    expect(areas[1].id).to.equal('recArea2');
  });

  it('builds competences', async () => {
    // given
    const learningContent = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recArea1_Competence1',
            tubes: [],
          },
          {
            id: 'recArea1_Competence2',
            tubes: [],
          },
        ],
      },
      {
        id: 'recArea2',
        competences: [
          {
            id: 'recArea2_Competence1',
            tubes: [],
            origin: 'Pix+',
          },
          {
            id: 'recArea2_Competence2',
            tubes: [],
            origin: 'Pix+',
          },
        ],
      },
    ];

    // when
    const learningContentObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const areas = await areaDatasource.list();
    const competences = await competenceDatasource.list();
    expect(areas[0].competenceIds).to.deep.equal(['recArea1_Competence1', 'recArea1_Competence2']);
    expect(areas[1].competenceIds).to.deep.equal(['recArea2_Competence1', 'recArea2_Competence2']);
    expect(competences[0].id).to.deep.equal('recArea1_Competence1');
    expect(competences[0].areaId).to.deep.equal('recArea1');
    expect(competences[0].origin).to.deep.equal('Pix');
    expect(competences[1].id).to.deep.equal('recArea1_Competence2');
    expect(competences[1].areaId).to.deep.equal('recArea1');
    expect(competences[1].origin).to.deep.equal('Pix');
    expect(competences[2].id).to.deep.equal('recArea2_Competence1');
    expect(competences[2].areaId).to.deep.equal('recArea2');
    expect(competences[2].origin).to.deep.equal('Pix+');
    expect(competences[3].id).to.deep.equal('recArea2_Competence2');
    expect(competences[3].areaId).to.deep.equal('recArea2');
    expect(competences[3].origin).to.deep.equal('Pix+');
  });

  it('builds tubes', async () => {
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
                skills: [],
              },
              {
                id: 'recArea1_Competence1_Tube2',
                skills: [],
              },
            ],
          },
        ],
      },
    ];

    // when
    const learningContentObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const competences = await competenceDatasource.list();
    const tubes = await tubeDatasource.list();
    expect(competences[0].id).to.deep.equal('recArea1_Competence1');
    expect(tubes[0].id).to.deep.equal('recArea1_Competence1_Tube1');
    expect(tubes[0].competenceId).to.deep.equal('recArea1_Competence1');
    expect(tubes[1].id).to.deep.equal('recArea1_Competence1_Tube2');
    expect(tubes[1].competenceId).to.deep.equal('recArea1_Competence1');
  });

  it('builds skills', async () => {
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
                    nom: '@accesDonnées1',
                    status: 'actif',
                    challenges: [],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill2',
                    nom: '@accesDonnées2',
                    status: 'archivé',
                    challenges: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    // when
    const learningContentObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const competences = await competenceDatasource.list();
    const skills = await skillDatasource.list();
    expect(competences[0].skillIds).to.deep.equal(['recArea1_Competence1_Tube1_Skill1', 'recArea1_Competence1_Tube1_Skill2']);
    expect(skills[0].id).to.deep.equal('recArea1_Competence1_Tube1_Skill1');
    expect(skills[0].competenceId).to.deep.equal('recArea1_Competence1');
    expect(skills[0].tubeId).to.deep.equal('recArea1_Competence1_Tube1');
    expect(skills[0].status).to.deep.equal('actif');
    expect(skills[0].name).to.deep.equal('@accesDonnées1');

    expect(skills[1].id).to.deep.equal('recArea1_Competence1_Tube1_Skill2');
    expect(skills[1].competenceId).to.deep.equal('recArea1_Competence1');
    expect(skills[1].tubeId).to.deep.equal('recArea1_Competence1_Tube1');
    expect(skills[1].status).to.deep.equal('archivé');
    expect(skills[1].name).to.deep.equal('@accesDonnées2');
  });

  it('builds challenges', async () => {
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
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                      },
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge2',
                        statut: 'archivé',
                        langues: ['Francophone', 'Franco Français'],
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

    // when
    const learningContentObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const challenges = await challengeDatasource.list();
    expect(challenges[0].id).to.equal('recArea1_Competence1_Tube1_Skill1_Challenge1');
    expect(challenges[0].skillIds).to.deep.equal(['recArea1_Competence1_Tube1_Skill1']);
    expect(challenges[0].status).to.deep.equal('validé');
    expect(challenges[1].id).to.equal('recArea1_Competence1_Tube1_Skill1_Challenge2');
    expect(challenges[1].skillIds).to.deep.equal(['recArea1_Competence1_Tube1_Skill1']);
    expect(challenges[1].status).to.deep.equal('archivé');
    expect(challenges[1].locales).to.deep.equal(['fr', 'fr-fr']);
  });

  it('builds challenges | a single challenge is linked several skills', async() => {
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
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
                        statut: 'validé',
                      },
                    ],
                  },
                  {
                    id: 'recArea1_Competence1_Tube1_Skill2',
                    status: 'actif',
                    challenges: [
                      {
                        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1', // same id
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

    // when
    const learningContentObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const challenges = await challengeDatasource.list();
    expect(challenges[0].id).to.equal('recArea1_Competence1_Tube1_Skill1_Challenge1');
    expect(challenges[0].skillIds).to.deep.equal(['recArea1_Competence1_Tube1_Skill1', 'recArea1_Competence1_Tube1_Skill2']);
    expect(challenges[0].status).to.deep.equal('validé');
  });

  it('builds a consistent learning content', async() => {
    // given
    const learningContent = [
      {
        id: 'recArea0',
        competences: [
          {
            id: 'recCompetence0',
            tubes: [
              {
                id: 'recTube0_0',
                skills: [
                  {
                    id: 'recSkill0_0',
                    nom: '@recSkill0_0',
                    challenges: [
                      { id: 'recChallenge0_0_0' },
                    ],
                  },
                  {
                    id: 'recSkill0_1',
                    nom: '@recSkill0_1',
                    challenges: [
                      { id: 'recChallenge0_1_0' },
                    ],
                  },
                  {
                    id: 'recSkill0_2',
                    nom: '@recSkill0_2',
                    challenges: [
                      { id: 'recChallenge0_2_0' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence1',
            tubes: [
              {
                id: 'recTube1_0',
                skills: [
                  {
                    id: 'recSkill1_0',
                    nom: '@recSkill1_0',
                    challenges: [
                      { id: 'recChallenge1_0_0' },
                    ],
                  },
                  {
                    id: 'recSkill1_1',
                    nom: '@recSkill1_1',
                    challenges: [
                      { id: 'recChallenge1_1_0' },
                    ],
                  },
                  {
                    id: 'recSkill1_2',
                    nom: '@recSkill1_2',
                    challenges: [
                      { id: 'recChallenge1_2_0' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence2',
            tubes: [
              {
                id: 'recTube2_0',
                skills: [
                  {
                    id: 'recSkill2_0',
                    nom: '@recSkill2_0',
                    challenges: [
                      { id: 'recChallenge2_0_0' },
                    ],
                  },
                  {
                    id: 'recSkill2_1',
                    nom: '@recSkill2_1',
                    challenges: [
                      { id: 'recChallenge2_1_0' },
                    ],
                  },
                  {
                    id: 'recSkill2_2',
                    nom: '@recSkill2_2',
                    challenges: [
                      { id: 'recChallenge2_2_0' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence3',
            tubes: [
              {
                id: 'recTube3_0',
                skills: [
                  {
                    id: 'recSkill3_0',
                    nom: '@recSkill3_0',
                    challenges: [
                      { id: 'recChallenge3_0_0' },
                    ],
                  },
                  {
                    id: 'recSkill3_1',
                    nom: '@recSkill3_1',
                    challenges: [
                      { id: 'recChallenge3_1_0' },
                    ],
                  },
                  {
                    id: 'recSkill3_2',
                    nom: '@recSkill3_2',
                    challenges: [
                      { id: 'recChallenge3_2_0' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence4',
            tubes: [
              {
                id: 'recTube4_0',
                skills: [
                  {
                    id: 'recSkill4_0',
                    nom: '@recSkill4_0',
                    challenges: [
                      { id: 'recChallenge4_0_0' },
                    ],
                  },
                  {
                    id: 'recSkill4_1',
                    nom: '@recSkill4_1',
                    challenges: [
                      { id: 'recChallenge4_1_0' },
                    ],
                  },
                  {
                    id: 'recSkill4_2',
                    nom: '@recSkill4_2',
                    challenges: [
                      { id: 'recChallenge4_2_0' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    // when
    const learningContentObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const challenges = await challengeDatasource.list();
    expect(challenges[0].id).to.equal('recArea1_Competence1_Tube1_Skill1_Challenge1');
    expect(challenges[0].skillIds).to.deep.equal(['recArea1_Competence1_Tube1_Skill1', 'recArea1_Competence1_Tube1_Skill2']);
    expect(challenges[0].status).to.deep.equal('validé');
  });
});
