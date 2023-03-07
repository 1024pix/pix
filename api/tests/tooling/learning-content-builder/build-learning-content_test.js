const { expect, learningContentBuilder, mockLearningContent } = require('../../test-helper');
const { areaDatasource } = require('../../../lib/infrastructure/datasources/learning-content/area-datasource');
const {
  competenceDatasource,
} = require('../../../lib/infrastructure/datasources/learning-content/competence-datasource');
const { tubeDatasource } = require('../../../lib/infrastructure/datasources/learning-content/tube-datasource');
const { skillDatasource } = require('../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const {
  challengeDatasource,
} = require('../../../lib/infrastructure/datasources/learning-content/challenge-datasource');
const { courseDatasource } = require('../../../lib/infrastructure/datasources/learning-content/course-datasource');
const {
  frameworkDatasource,
} = require('../../../lib/infrastructure/datasources/learning-content/framework-datasource');

describe('Integration | buildLearningContent', function () {
  it('builds areas and frameworks', async function () {
    // given
    const learningContent = [
      {
        id: 'recFramework1',
        name: 'monFramework 1',
        areas: [
          {
            id: 'recArea1',
            competences: [],
          },
        ],
      },
      {
        id: 'recFramework2',
        name: 'monFramework 2',
        areas: [
          {
            id: 'recArea2',
            competences: [],
            frameworkId: 'test',
          },
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const areas = await areaDatasource.list();
    const frameworks = await frameworkDatasource.list();
    expect(areas[0].id).to.equal('recArea1');
    expect(areas[1].id).to.equal('recArea2');
    expect(frameworks.length).to.equal(2);
    expect(frameworks[0].id).to.deep.equal('recFramework1');
    expect(frameworks[0].name).to.deep.equal('monFramework 1');
    expect(frameworks[1].id).to.deep.equal('recFramework2');
    expect(frameworks[1].name).to.deep.equal('monFramework 2');
  });

  it('builds competences', async function () {
    // given
    const learningContent = [
      {
        id: 'recFramework1',
        name: 'monFramework 1',
        areas: [
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
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
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

  it('builds tubes', async function () {
    // given
    const learningContent = [
      {
        id: 'recFramework1',
        name: 'monFramework 1',
        areas: [
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
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
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

  it('builds skills', async function () {
    // given
    const learningContent = [
      {
        id: 'recFramework1',
        name: 'monFramework 1',
        areas: [
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
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const competences = await competenceDatasource.list();
    const skills = await skillDatasource.list();
    expect(competences[0].skillIds).to.deep.equal([
      'recArea1_Competence1_Tube1_Skill1',
      'recArea1_Competence1_Tube1_Skill2',
    ]);
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

  it('builds challenges', async function () {
    // given
    const learningContent = [
      {
        id: 'recFramework1',
        name: 'monFramework 1',
        areas: [
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
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const challenges = await challengeDatasource.list();
    expect(challenges[0].id).to.equal('recArea1_Competence1_Tube1_Skill1_Challenge1');
    expect(challenges[0].skillId).to.deep.equal('recArea1_Competence1_Tube1_Skill1');
    expect(challenges[0].status).to.deep.equal('validé');
    expect(challenges[1].id).to.equal('recArea1_Competence1_Tube1_Skill1_Challenge2');
    expect(challenges[1].skillId).to.deep.equal('recArea1_Competence1_Tube1_Skill1');
    expect(challenges[1].status).to.deep.equal('archivé');
    expect(challenges[1].locales).to.deep.equal(['fr', 'fr-fr']);
  });

  it('builds courses', async function () {
    // given
    const learningContent = [
      {
        id: 'recFramework1',
        name: 'monFramework 1',
        areas: [
          {
            competences: [],
            courses: [
              {
                id: 'recCourse0',
                name: 'Test de démo 0',
                challengeIds: ['second_challenge', 'first_challenge'],
              },
              {
                id: 'recCourse1',
                name: 'Test de démo 1',
                challengeIds: ['first_challenge'],
              },
            ],
          },
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const courses = await courseDatasource.list();
    expect(courses[0].id).to.equal('recCourse0');
    expect(courses[1].id).to.equal('recCourse1');
  });
});
