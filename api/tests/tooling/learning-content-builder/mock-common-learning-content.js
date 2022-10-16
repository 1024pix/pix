const nock = require('nock');
const buildLearningContent = require('./build-learning-content');

const learningContentTree = [
  {
    id: 'frameworkPix',
    name: 'Pix',
    areas: [
      {
        id: 'areaPixA1',
        code: '1',
        name: 'areaPixA1 name',
        titleFr: 'areaPixA1 title FR',
        titleEn: 'areaPixA1 title EN',
        color: 'areaPixA1 color',
        frameworkId: 'frameworkPix',
        competences: [
          {
            id: 'competencePixA1C1',
            origin: 'Pix',
            index: '1.1',
            name: 'competencePixA1C1 name NOLANG',
            nameFr: 'competencePixA1C1 name FR',
            nameEn: 'competencePixA1C1 name EN',
            description: 'competencePixA1C1 description NOLANG',
            descriptionFr: 'competencePixA1C1 description FR',
            descriptionEn: 'competencePixA1C1 description EN',
            thematics: [
              {
                id: 'thematicPixA1C1Th1',
                name: 'thematicPixA1C1Th1 name NOLANG',
                nameFr: 'thematicPixA1C1Th1 name FR',
                nameEn: 'thematicPixA1C1Th1 name EN',
                index: '1',
                tubes: [
                  {
                    id: 'tubePixA1C1Th1Tu1',
                    name: '@tubePixA1C1Th1Tu1name',
                    description: 'tubePixA1C1Th1Tu1 description',
                    title: 'tubePixA1C1Th1Tu1 title',
                    practicalTitle: 'tubePixA1C1Th1Tu1 practicalTitle NOLANG',
                    practicalDescription: 'tubePixA1C1Th1Tu1 practicalDescription NOLANG',
                    practicalTitleFr: 'tubePixA1C1Th1Tu1 practicalTitle FR',
                    practicalDescriptionFr: 'tubePixA1C1Th1Tu1 practicalDescription FR',
                    practicalTitleEn: 'tubePixA1C1Th1Tu1 practicalTitle EN',
                    practicalDescriptionEn: 'tubePixA1C1Th1Tu1 practicalDescription EN',
                    skills: [
                      {
                        id: 'skillPixA1C1Th1Tu1S1',
                        status: 'actif',
                        hintFr: 'skillPixA1C1Th1Tu1S1 hint FR',
                        hintEn: 'skillPixA1C1Th1Tu1S1 hint EN',
                        hintStatus: 'Validé',
                        name: '@tubePixA1C1Th1Tu1name1',
                        pixValue: 1,
                        version: '1',
                        level: 1,
                        tutorials: [
                          {
                            id: 'tutorialPixA1C1Th1Tu1S1Tuto1FR',
                            title: 'tutorialPixA1C1Th1Tu1S1Tuto1FR title',
                            format: 'vidéo',
                            source: 'tutorialPixA1C1Th1Tu1S1Tuto1FR source',
                            link: 'http://www.example.com/tutorialPixA1C1Th1Tu1S1Tuto1FR.html',
                            locale: 'fr-fr',
                            duration: '00:03:31',
                          },
                          {
                            id: 'tutorialPixA1C1Th1Tu1S1Tuto2FR',
                            title: 'tutorialPixA1C1Th1Tu1S1Tuto2FR title',
                            format: 'vidéo',
                            source: 'tutorialPixA1C1Th1Tu1S1Tuto2FR source',
                            link: 'http://www.example.com/tutorialPixA1C1Th1Tu1S1Tuto2FR.html',
                            locale: 'fr-fr',
                            duration: '00:01:29',
                          },
                          {
                            id: 'tutorialPixA1C1Th1Tu1S1EN',
                            title: 'tutorialPixA1C1Th1Tu1S1EN title',
                            format: 'vidéo',
                            source: 'tutorialPixA1C1Th1Tu1S1EN source',
                            link: 'http://www.example.com/tutorialPixA1C1Th1Tu1S1EN.html',
                            locale: 'en-us',
                            duration: '00:03:31',
                          },
                        ],
                        challenges: [
                          {
                            id: 'challengePixA1C1Th1Tu1S1Ch1',
                            statut: 'validé',
                            langues: ['Franco Français'],
                            solution: 'challengePixA1C1Th1Tu1S1Ch1 solution',
                            solutionToDisplay: 'challengePixA1C1Th1Tu1S1Ch1 solutionToDisplay',
                            type: 'QCU',
                            focusable: false,
                            instruction: 'challengePixA1C1Th1Tu1S1Ch1 instruction',
                            alternativeInstruction: 'challengePixA1C1Th1Tu1S1Ch1 alternativeInstruction',
                            proposals: 'challengePixA1C1Th1Tu1S1Ch1 proposals',
                            autoReply: false,
                            alpha: null,
                            delta: null,
                            timer: null,
                            illustrationUrl: 'challengePixA1C1Th1Tu1S1Ch1 illustrationUrl',
                            illustrationAlt: 'challengePixA1C1Th1Tu1S1Ch1 illustrationAlt',
                            attachments: ['challengePixA1C1Th1Tu1S1Ch1 attachment1'],
                            embedUrl: 'challengePixA1C1Th1Tu1S1Ch1 embedUrl',
                            embedTitle: 'challengePixA1C1Th1Tu1S1Ch1 embedTitle',
                            embedHeight: 'challengePixA1C1Th1Tu1S1Ch1 embedHeight',
                            format: 'challengePixA1C1Th1Tu1S1Ch1 format',
                            responsive: 'Tablette',
                            genealogy: 'challengePixA1C1Th1Tu1S1Ch1 genealogy',
                          },
                        ],
                      },
                      {
                        id: 'skillPixA1C1Th1Tu1S2',
                        status: 'actif',
                        name: '@tubePixA1C1Th1Tu1name2',
                        pixValue: 2,
                        version: '1',
                        level: 2,
                        tutorials: [
                          {
                            id: 'tutorialPixA1C1Th1Tu1S2Tuto1FR',
                            title: 'tutorialPixA1C1Th1Tu1S2Tuto1FR title',
                            format: 'vidéo',
                            source: 'tutorialPixA1C1Th1Tu1S2Tuto1FR source',
                            link: 'http://www.example.com/tutorialPixA1C1Th1Tu1S1Tuto1FR.html',
                            locale: 'fr-fr',
                            duration: '00:02:26',
                          },
                        ],
                        challenges: [
                          {
                            id: 'challengePixA1C1Th1Tu1S2Ch1',
                            statut: 'validé',
                            langues: ['Franco Français'],
                            solution: 'challengePixA1C1Th1Tu1S2Ch1 solution',
                            solutionToDisplay: 'challengePixA1C1Th1Tu1S2Ch1 solutionToDisplay',
                            type: 'QCU',
                            focusable: false,
                            instruction: 'challengePixA1C1Th1Tu1S2Ch1 instruction',
                            alternativeInstruction: 'challengePixA1C1Th1Tu1S2Ch1 alternativeInstruction',
                            proposals: 'challengePixA1C1Th1Tu1S2Ch1 proposals',
                            autoReply: false,
                            alpha: null,
                            delta: null,
                            timer: null,
                            illustrationUrl: 'challengePixA1C1Th1Tu1S2Ch1 illustrationUrl',
                            illustrationAlt: 'challengePixA1C1Th1Tu1S2Ch1 illustrationAlt',
                            attachments: ['challengePixA1C1Th1Tu1S2Ch1 attachment1'],
                            embedUrl: 'challengePixA1C1Th1Tu1S2Ch1 embedUrl',
                            embedTitle: 'challengePixA1C1Th1Tu1S2Ch1 embedTitle',
                            embedHeight: 'challengePixA1C1Th1Tu1S2Ch1 embedHeight',
                            format: 'challengePixA1C1Th1Tu1S2Ch1 format',
                            responsive: 'Tablette',
                            genealogy: 'challengePixA1C1Th1Tu1S2Ch1 genealogy',
                          },
                        ],
                      },
                      {
                        id: 'skillPixA1C1Th1Tu1S3',
                        status: 'actif',
                        name: '@tubePixA1C1Th1Tu1name3',
                        pixValue: 3,
                        version: '1',
                        level: 3,
                        tutorials: [],
                        challenges: [
                          {
                            id: 'challengePixA1C1Th1Tu1S3Ch1',
                            statut: 'validé',
                            langues: ['Franco Français'],
                            solution: 'challengePixA1C1Th1Tu1S3Ch1 solution',
                            solutionToDisplay: 'challengePixA1C1Th1Tu1S3Ch1 solutionToDisplay',
                            type: 'QROC',
                            focusable: false,
                            instruction: 'challengePixA1C1Th1Tu1S3Ch1 instruction',
                            alternativeInstruction: 'challengePixA1C1Th1Tu1S3Ch1 alternativeInstruction',
                            proposals: 'challengePixA1C1Th1Tu1S3Ch1 proposals',
                            autoReply: false,
                            alpha: null,
                            delta: null,
                            timer: null,
                            illustrationUrl: 'challengePixA1C1Th1Tu1S3Ch1 illustrationUrl',
                            illustrationAlt: 'challengePixA1C1Th1Tu1S3Ch1 illustrationAlt',
                            attachments: ['challengePixA1C1Th1Tu1S3Ch1 attachment1'],
                            embedUrl: 'challengePixA1C1Th1Tu1S3Ch1 embedUrl',
                            embedTitle: 'challengePixA1C1Th1Tu1S3Ch1 embedTitle',
                            embedHeight: 'challengePixA1C1Th1Tu1S3Ch1 embedHeight',
                            format: 'challengePixA1C1Th1Tu1S3Ch1 format',
                            responsive: 'Tablette',
                            genealogy: 'challengePixA1C1Th1Tu1S3Ch1 genealogy',
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
        courses: [
          {
            id: 'recCourse1',
            name: 'recCourse1 name',
            description: 'recCourse1 description',
            challengeIds: ['challengePixA1C1Th1Tu1S1Ch1'],
          },
        ],
      },
    ],
  },
  {
    id: 'frameworkCuisine',
    name: 'Cuisine',
    areas: [
      {
        id: 'areaCuisineA2',
        code: '2',
        name: 'areaCuisineA2 name',
        titleFr: 'areaCuisineA2 title FR',
        titleEn: 'areaCuisineA2 title EN',
        color: 'red',
        frameworkId: 'frameworkCuisine',
        competences: [
          {
            id: 'competenceCuisineA2C1',
            origin: 'Cuisine',
            index: '2.1',
            name: 'competenceCuisineA2C1 name NOLANG',
            nameFr: 'competenceCuisineA2C1 name FR',
            nameEn: 'competenceCuisineA2C1 name EN',
            description: 'competenceCuisineA2C1 description NOLANG',
            descriptionFr: 'competenceCuisineA2C1 description FR',
            descriptionEn: 'competenceCuisineA2C1 description EN',
            thematics: [
              {
                id: 'thematicCuisineA2C1Th1',
                name: 'thematicCuisineA2C1Th1 name NOLANG',
                nameFr: 'thematicCuisineA2C1Th1 name FR',
                nameEn: 'thematicCuisineA2C1Th1 name EN',
                index: '1',
                tubes: [
                  {
                    id: 'tubeCuisineA2C1Th1Tu1',
                    name: '@tubeCuisineA2C1Th1Tu1name',
                    description: 'tubeCuisineA2C1Th1Tu1 description',
                    title: 'tubeCuisineA2C1Th1Tu1 title',
                    practicalTitle: 'tubeCuisineA2C1Th1Tu1 practicalTitle NOLANG',
                    practicalDescription: 'tubeCuisineA2C1Th1Tu1 practicalDescription NOLANG',
                    practicalTitleFr: 'tubeCuisineA2C1Th1Tu1 practicalTitle FR',
                    practicalDescriptionFr: 'tubeCuisineA2C1Th1Tu1 practicalDescription FR',
                    practicalTitleEn: 'tubeCuisineA2C1Th1Tu1 practicalTitle EN',
                    practicalDescriptionEn: 'tubeCuisineA2C1Th1Tu1 practicalDescription EN',
                    skills: [
                      {
                        id: 'skillCuisineA2C1Th1Tu1S1',
                        status: 'actif',
                        hintFr: 'skillCuisineA2C1Th1Tu1S1 hint FR',
                        hintEn: 'skillCuisineA2C1Th1Tu1S1 hint EN',
                        hintStatus: 'Validé',
                        name: '@tubeCuisineA2C1Th1Tu1name1',
                        pixValue: 1,
                        version: '1',
                        level: 1,
                        tutorials: [],
                        challenges: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        courses: [],
      },
    ],
  },
];

const areas = [];
const competences = [];
const thematics = [];
const tubes = [];
const skills = [];
const challenges = [];
const tutorials = [];
const courses = [];

const LearningContentMock = {
  mockCommon: () => {
    const learningContentFromLCMS = buildLearningContent(learningContentTree);
    _flattenContent();
    nock('https://lcms-test.pix.fr/api')
      .get('/releases/latest')
      .matchHeader('Authorization', 'Bearer test-api-key')
      .reply(200, { content: learningContentFromLCMS });
  },

  getAreaDTO(areaId) {
    return areas.find(({ id }) => id === areaId);
  },

  getCompetenceDTO(competenceId) {
    return competences.find(({ id }) => id === competenceId);
  },

  getThematicDTO(thematicId) {
    return thematics.find(({ id }) => id === thematicId);
  },

  getTubeDTO(tubeId) {
    return tubes.find(({ id }) => id === tubeId);
  },

  getSkillDTO(skillId) {
    return skills.find(({ id }) => id === skillId);
  },

  getTutorialDTO(tutorialId) {
    return tutorials.find(({ id }) => id === tutorialId);
  },

  getChallengeDTO(challengeId) {
    return challenges.find(({ id }) => id === challengeId);
  },

  getCourseDTO(courseId) {
    return courses.find(({ id }) => id === courseId);
  },
};

function _flattenContent() {
  for (const framework of learningContentTree) {
    for (const area of framework.areas) {
      areas.push(area);
      const competenceIds = [];
      for (const competence of area.competences) {
        competences.push(competence);
        competenceIds.push(competence.id);
        const skillIdsForCompetence = [];
        const thematicIds = [];
        for (const thematic of competence.thematics) {
          thematics.push(thematic);
          thematicIds.push(thematic.id);
          const tubeIds = [];
          for (const tube of thematic.tubes) {
            tubes.push(tube);
            tubeIds.push(tube.id);
            const skillIdsForTube = [];
            for (const skill of tube.skills) {
              skills.push(skill);
              skillIdsForCompetence.push(skill.id);
              skillIdsForTube.push(skill.id);
              for (const tutorial of skill.tutorials) {
                tutorials.push(tutorial);
              }
              for (const challenge of skill.challenges) {
                challenges.push(challenge);
              }
            }
            tube.skillIds = skillIdsForTube;
          }
          thematic.tubeIds = tubeIds;
        }
        competence.skillIds = skillIdsForCompetence;
        competence.thematicIds = thematicIds;
      }
      area.competenceIds = competenceIds;
      const courseIds = [];
      for (const course of area.courses) {
        courses.push(course);
      }
      area.courseIds = courseIds;
    }
  }
}

module.exports = LearningContentMock;
