import { expect, learningContentBuilder, mockLearningContent } from '../../test-helper.js';
import { areaDatasource } from '../../../lib/infrastructure/datasources/learning-content/area-datasource.js';
import { competenceDatasource } from '../../../lib/infrastructure/datasources/learning-content/competence-datasource.js';
import { thematicDatasource } from '../../../src/shared/infrastructure/datasources/learning-content/thematic-datasource.js';
import { tubeDatasource } from '../../../lib/infrastructure/datasources/learning-content/tube-datasource.js';
import { skillDatasource } from '../../../lib/infrastructure/datasources/learning-content/skill-datasource.js';
import { challengeDatasource } from '../../../lib/infrastructure/datasources/learning-content/challenge-datasource.js';
import { courseDatasource } from '../../../lib/infrastructure/datasources/learning-content/course-datasource.js';
import { frameworkDatasource } from '../../../lib/infrastructure/datasources/learning-content/framework-datasource.js';

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
            title_i18n: {
              fr: 'domaine1_Titre',
              en: 'area1_Title',
            },
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
            title_i18n: {
              fr: 'domaine2_Titre',
              en: 'area2_Title',
            },
            competences: [],
            frameworkId: 'test',
          },
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const areas = await areaDatasource.list();
    const frameworks = await frameworkDatasource.list();
    expect(areas[0].id).to.equal('recArea1');
    expect(areas[0].title_i18n.fr).to.equal('domaine1_Titre');
    expect(areas[0].title_i18n.en).to.equal('area1_Title');
    expect(areas[1].id).to.equal('recArea2');
    expect(areas[1].title_i18n.fr).to.equal('domaine2_Titre');
    expect(areas[1].title_i18n.en).to.equal('area2_Title');
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
                name_i18n: { fr: 'competence1_nomFr', en: 'competence1_nameEn' },
                description_i18n: { fr: 'competence1_descriptionFr', en: 'competence1_descriptionEn' },
                tubes: [],
              },
              {
                id: 'recArea1_Competence2',
                name_i18n: { fr: 'competence2_nomFr', en: 'competence2_nameEn' },
                description_i18n: { fr: 'competence2_descriptionFr', en: 'competence2_descriptionEn' },
                tubes: [],
              },
            ],
          },
          {
            id: 'recArea2',
            competences: [
              {
                id: 'recArea2_Competence1',
                name_i18n: { fr: 'domaine2_competence1_nomFr', en: 'area2_competence1_nameEn' },
                description_i18n: { fr: 'domaine2_competence1_descriptionFr', en: 'area2_competence1_descriptionEn' },
                tubes: [],
                origin: 'Pix+',
              },
              {
                id: 'recArea2_Competence2',
                name_i18n: { fr: 'domaine2_competence2_nomFr', en: 'area2_competence2_nameEn' },
                description_i18n: { fr: 'domaine2_competence2_descriptionFr', en: 'area2_competence2_descriptionEn' },
                tubes: [],
                origin: 'Pix+',
              },
            ],
          },
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const areas = await areaDatasource.list();
    const competences = await competenceDatasource.list();
    expect(areas[0].competenceIds).to.deep.equal(['recArea1_Competence1', 'recArea1_Competence2']);
    expect(areas[1].competenceIds).to.deep.equal(['recArea2_Competence1', 'recArea2_Competence2']);
    expect(competences[0].id).to.deep.equal('recArea1_Competence1');
    expect(competences[0].areaId).to.deep.equal('recArea1');
    expect(competences[0].name_i18n.fr).to.deep.equal('competence1_nomFr');
    expect(competences[0].name_i18n.en).to.deep.equal('competence1_nameEn');
    expect(competences[0].description_i18n.fr).to.deep.equal('competence1_descriptionFr');
    expect(competences[0].description_i18n.en).to.deep.equal('competence1_descriptionEn');
    expect(competences[0].origin).to.deep.equal('Pix');
    expect(competences[1].id).to.deep.equal('recArea1_Competence2');
    expect(competences[1].areaId).to.deep.equal('recArea1');
    expect(competences[1].name_i18n.fr).to.deep.equal('competence2_nomFr');
    expect(competences[1].name_i18n.en).to.deep.equal('competence2_nameEn');
    expect(competences[1].description_i18n.fr).to.deep.equal('competence2_descriptionFr');
    expect(competences[1].description_i18n.en).to.deep.equal('competence2_descriptionEn');
    expect(competences[1].origin).to.deep.equal('Pix');
    expect(competences[2].id).to.deep.equal('recArea2_Competence1');
    expect(competences[2].areaId).to.deep.equal('recArea2');
    expect(competences[2].name_i18n.fr).to.deep.equal('domaine2_competence1_nomFr');
    expect(competences[2].name_i18n.en).to.deep.equal('area2_competence1_nameEn');
    expect(competences[2].description_i18n.fr).to.deep.equal('domaine2_competence1_descriptionFr');
    expect(competences[2].description_i18n.en).to.deep.equal('area2_competence1_descriptionEn');
    expect(competences[2].origin).to.deep.equal('Pix+');
    expect(competences[3].id).to.deep.equal('recArea2_Competence2');
    expect(competences[3].areaId).to.deep.equal('recArea2');
    expect(competences[3].name_i18n.fr).to.deep.equal('domaine2_competence2_nomFr');
    expect(competences[3].name_i18n.en).to.deep.equal('area2_competence2_nameEn');
    expect(competences[3].description_i18n.fr).to.deep.equal('domaine2_competence2_descriptionFr');
    expect(competences[3].description_i18n.en).to.deep.equal('area2_competence2_descriptionEn');
    expect(competences[3].origin).to.deep.equal('Pix+');
  });

  it('builds thematics', async function () {
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
                thematics: [
                  {
                    id: 'recThematic1',
                    name_i18n: { fr: 'thematique1_nomFr', en: 'thematic1_nameEn' },
                  },
                ],
              },
              {
                id: 'recArea1_Competence2',
                thematics: [
                  {
                    id: 'recThematic2',
                    name_i18n: { fr: 'thematique2_nomFr', en: 'thematic2_nameEn' },
                  },
                ],
              },
            ],
          },
          {
            id: 'recArea2',
            competences: [
              {
                id: 'recArea2_Competence1',
                thematics: [
                  {
                    id: 'recArea2_Thematic1',
                    name_i18n: { fr: 'domaine2_thematique1_nomFr', en: 'area2_thematic1_nameEn' },
                  },
                ],
                origin: 'Pix+',
              },
              {
                id: 'recArea2_Competence2',
                thematics: [
                  {
                    id: 'recArea2_Thematic2',
                    name_i18n: { fr: 'domaine2_thematique2_nomFr', en: 'area2_thematic2_nameEn' },
                  },
                ],
                origin: 'Pix+',
              },
            ],
          },
        ],
      },
    ];

    // when
    const learningContentObjects = learningContentBuilder(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const areas = await areaDatasource.list();
    const competences = await competenceDatasource.list();
    const thematics = await thematicDatasource.list();
    expect(areas[0].competenceIds).to.deep.equal(['recArea1_Competence1', 'recArea1_Competence2']);
    expect(areas[1].competenceIds).to.deep.equal(['recArea2_Competence1', 'recArea2_Competence2']);
    expect(competences[0].id).to.deep.equal('recArea1_Competence1');
    expect(competences[1].id).to.deep.equal('recArea1_Competence2');
    expect(competences[2].id).to.deep.equal('recArea2_Competence1');
    expect(competences[3].id).to.deep.equal('recArea2_Competence2');
    expect(thematics[0].id).to.deep.equal('recThematic1');
    expect(thematics[0].name_i18n.fr).to.deep.equal('thematique1_nomFr');
    expect(thematics[0].name_i18n.en).to.deep.equal('thematic1_nameEn');
    expect(thematics[1].id).to.deep.equal('recThematic2');
    expect(thematics[1].name_i18n.fr).to.deep.equal('thematique2_nomFr');
    expect(thematics[1].name_i18n.en).to.deep.equal('thematic2_nameEn');
    expect(thematics[2].id).to.deep.equal('recArea2_Thematic1');
    expect(thematics[2].name_i18n.fr).to.deep.equal('domaine2_thematique1_nomFr');
    expect(thematics[2].name_i18n.en).to.deep.equal('area2_thematic1_nameEn');
    expect(thematics[3].id).to.deep.equal('recArea2_Thematic2');
    expect(thematics[3].name_i18n.fr).to.deep.equal('domaine2_thematique2_nomFr');
    expect(thematics[3].name_i18n.en).to.deep.equal('area2_thematic2_nameEn');
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
                    practicalTitle_i18n: { fr: 'titrePratique1_fr', en: 'practicalTitle1_en' },
                    practicalDescription_i18n: { fr: 'descriptionPratique1_fr', en: 'practicalDescription1_en' },
                    skills: [],
                  },
                  {
                    id: 'recArea1_Competence1_Tube2',
                    practicalTitle_i18n: { fr: 'titrePratique2_fr', en: 'practicalTitle2_en' },
                    practicalDescription_i18n: { fr: 'descriptionPratique2_fr', en: 'practicalDescription2_en' },
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
    const learningContentObjects = learningContentBuilder(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const competences = await competenceDatasource.list();
    const tubes = await tubeDatasource.list();
    expect(competences[0].id).to.deep.equal('recArea1_Competence1');
    expect(tubes[0].id).to.deep.equal('recArea1_Competence1_Tube1');
    expect(tubes[0].competenceId).to.deep.equal('recArea1_Competence1');
    expect(tubes[0].practicalTitle_i18n.fr).to.deep.equal('titrePratique1_fr');
    expect(tubes[0].practicalTitle_i18n.en).to.deep.equal('practicalTitle1_en');
    expect(tubes[0].practicalDescription_i18n.fr).to.deep.equal('descriptionPratique1_fr');
    expect(tubes[0].practicalDescription_i18n.en).to.deep.equal('practicalDescription1_en');
    expect(tubes[1].id).to.deep.equal('recArea1_Competence1_Tube2');
    expect(tubes[1].competenceId).to.deep.equal('recArea1_Competence1');
    expect(tubes[1].practicalTitle_i18n.fr).to.deep.equal('titrePratique2_fr');
    expect(tubes[1].practicalTitle_i18n.en).to.deep.equal('practicalTitle2_en');
    expect(tubes[1].practicalDescription_i18n.fr).to.deep.equal('descriptionPratique2_fr');
    expect(tubes[1].practicalDescription_i18n.en).to.deep.equal('practicalDescription2_en');
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
    const learningContentObjects = learningContentBuilder(learningContent);
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
    const learningContentObjects = learningContentBuilder(learningContent);
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
    const learningContentObjects = learningContentBuilder(learningContent);
    mockLearningContent(learningContentObjects);

    // then
    const courses = await courseDatasource.list();
    expect(courses[0].id).to.equal('recCourse0');
    expect(courses[1].id).to.equal('recCourse1');
  });
});
