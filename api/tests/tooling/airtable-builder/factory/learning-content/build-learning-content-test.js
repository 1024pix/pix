const { expect, airtableBuilder } = require('../../../../test-helper');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/area-datasource');
const competenceDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/competence-datasource');
const tubeDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/tube-datasource');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/challenge-datasource');

describe('Integration | buildLearningContent', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

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
    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

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
    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

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
    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

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
    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

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
    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

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
    const airtableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
    airtableBuilder.mockLists(airtableObjects);

    // then
    const challenges = await challengeDatasource.list();
    expect(challenges[0].id).to.equal('recArea1_Competence1_Tube1_Skill1_Challenge1');
    expect(challenges[0].skillIds).to.deep.equal(['recArea1_Competence1_Tube1_Skill1', 'recArea1_Competence1_Tube1_Skill2']);
    expect(challenges[0].status).to.deep.equal('validé');
  });
});
