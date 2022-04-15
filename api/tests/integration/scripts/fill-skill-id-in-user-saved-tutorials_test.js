const {
  expect,
  databaseBuilder,
  learningContentBuilder,
  mockLearningContent,
  domainBuilder,
  knex,
  sinon,
} = require('../../test-helper');
const {
  getAllUserSavedTutorialsWithoutSkillId,
  getAllTutorials,
  getAllSkills,
  associateTutorialToUserSavedTutorial,
  associateSkillsToTutorial,
  getMostRelevantSkillId,
  main,
} = require('../../../scripts/fill-skill-id-in-user-saved-tutorials');
const { UserSavedTutorial } = require('../../../lib/domain/models/UserSavedTutorial');
const UserSavedTutorialWithTutorial = require('../../../lib/domain/models/UserSavedTutorialWithTutorial');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');

describe('Integration | Scripts | fill-skillId-in-user-saved-tutorials', function () {
  describe('#main', function () {
    describe('happy path', function () {
      let learningContentObjects;

      beforeEach(function () {
        sinon.stub(console, 'log');
        learningContentObjects = learningContentBuilder.buildLearningContent([
          {
            id: 'recArea1',
            titleFrFr: 'area1_Title',
            color: 'specialColor',
            competences: [
              {
                id: 'recCompetence1',
                name: 'Fabriquer un meuble',
                index: '1.1',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [
                      {
                        id: 'recSkill1',
                        nom: '@web1',
                        challenges: [],
                        tutorialIds: ['tuto1', 'tuto2'],
                        tutorials: [
                          {
                            id: 'tuto1',
                            locale: 'fr-fr',
                            duration: '00:00:54',
                            format: 'video',
                            link: 'http://www.example.com/this-is-an-example.html',
                            source: 'tuto.com',
                            title: 'tuto1',
                          },
                          {
                            id: 'tuto2',
                            locale: 'fr-fr',
                            duration: '00:01:51',
                            format: 'video',
                            link: 'http://www.example.com/this-is-an-example2.html',
                            source: 'tuto.com',
                            title: 'tuto2',
                          },
                        ],
                      },
                      {
                        id: 'recSkill2',
                        nom: '@web2',
                        challenges: [],
                        tutorialIds: ['tuto1'],
                        tutorials: [
                          {
                            id: 'tuto1',
                            locale: 'fr-fr',
                            duration: '00:00:54',
                            format: 'video',
                            link: 'http://www.example.com/this-is-an-example.html',
                            source: 'tuto.com',
                            title: 'tuto1',
                          },
                        ],
                      },
                      {
                        id: 'recSkill3',
                        nom: '@web3',
                        challenges: [],
                        tutorialIds: ['tuto4', 'tuto5'],
                        tutorials: [
                          {
                            id: 'tuto4',
                            locale: 'fr-fr',
                            duration: '00:04:38',
                            format: 'vidéo',
                            link: 'http://www.example.com/this-is-an-example4.html',
                            source: 'tuto.com',
                            title: 'tuto4',
                          },
                          {
                            id: 'tuto5',
                            locale: 'en-us',
                            duration: '00:04:38',
                            format: 'vidéo',
                            link: 'http://www.example.com/this-is-an-example5.html',
                            source: 'tuto.com',
                            title: 'tuto5',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);
      });

      it('should update the user-saved-tutorials with the skillId of the most recent invalidated KE', async function () {
        // given
        const mostRecentDirectInvalidatedSkillId = 'recSkill1';
        const oldestDirectInvalidatedSkillId = 'recSkill2';
        const directInvalidatedSkillId = 'recSkill3';

        const userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: mostRecentDirectInvalidatedSkillId,
          createdAt: new Date('2022-03-18'),
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: oldestDirectInvalidatedSkillId,
          createdAt: new Date('2022-03-16'),
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: directInvalidatedSkillId,
          createdAt: new Date('2022-03-16'),
        });

        const { id: userSavedTutorialId1 } = databaseBuilder.factory.buildUserSavedTutorial({
          userId,
          tutorialId: 'tuto1',
          skillId: null,
        });
        const { id: userSavedTutorialId2 } = databaseBuilder.factory.buildUserSavedTutorial({
          userId,
          tutorialId: 'tuto2',
          skillId: null,
        });

        await databaseBuilder.commit();

        // when
        await main();

        // then

        const [updatedUserSavedTutorial1] = await knex('user-saved-tutorials').where({ id: userSavedTutorialId1 });

        const [updatedUserSavedTutorial2] = await knex('user-saved-tutorials').where({ id: userSavedTutorialId2 });

        expect(updatedUserSavedTutorial1.skillId).to.equal(mostRecentDirectInvalidatedSkillId);
        expect(updatedUserSavedTutorial2.skillId).to.equal(mostRecentDirectInvalidatedSkillId);
      });

      describe('when the saved tutorial is not available anymore', function () {
        it('should not modify user-saved-tutorials', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;

          const { id: userSavedTutorialId1 } = databaseBuilder.factory.buildUserSavedTutorial({
            userId,
            tutorialId: 'notAvailable',
            skillId: null,
          });
          databaseBuilder.factory.buildUserSavedTutorial({
            userId: 123,
            tutorialId: 'tuto1',
            skillId: null,
          });
          await databaseBuilder.commit();

          // when
          await main();

          // then

          const [results] = await knex('user-saved-tutorials').where({ id: userSavedTutorialId1 });
          expect(results.skillId).to.equal(null);
        });
      });
    });
  });

  describe('#getAllUserSavedTutorialsWithoutSkillId', function () {
    it('should retrieve all user saved tutorials without skillId', async function () {
      // given
      databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'tuto1', skillId: null });
      databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'tuto2', skillId: 'skill1' });
      databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'tuto3', skillId: null });
      await databaseBuilder.commit();

      // when
      const userSavedTutorials = await getAllUserSavedTutorialsWithoutSkillId();

      // then
      expect(userSavedTutorials).to.be.lengthOf(2);
      expect(userSavedTutorials[0]).to.be.instanceOf(UserSavedTutorial);
      expect(userSavedTutorials[0].tutorialId).to.equal('tuto1');
      expect(userSavedTutorials[1].tutorialId).to.equal('tuto3');
      expect(userSavedTutorials.every((userSavedTutorials) => userSavedTutorials.skillId === null)).to.be.true;
    });
  });

  describe('#getAllTutorials', function () {
    it('should retrieve all tutorials', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent([
        {
          id: 'recArea1',
          titleFrFr: 'area1_Title',
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name: 'Fabriquer un meuble',
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      nom: '@web1',
                      challenges: [],
                      tutorialIds: ['tuto1', 'tuto2'],
                      tutorials: [
                        {
                          id: 'tuto1',
                          locale: 'fr-fr',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example.html',
                          source: 'tuto.com',
                          title: 'tuto1',
                        },
                        {
                          id: 'tuto2',
                          locale: 'fr-fr',
                          duration: '00:01:51',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example2.html',
                          source: 'tuto.com',
                          title: 'tuto2',
                        },
                      ],
                    },
                    {
                      id: 'recSkill2',
                      nom: '@web2',
                      challenges: [],
                      tutorialIds: ['tuto1'],
                      tutorials: [
                        {
                          id: 'tuto1',
                          locale: 'fr-fr',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example.html',
                          source: 'tuto.com',
                          title: 'tuto1',
                        },
                      ],
                    },
                    {
                      id: 'recSkill3',
                      nom: '@web3',
                      challenges: [],
                      tutorialIds: ['tuto4'],
                      tutorials: [
                        {
                          id: 'tuto4',
                          locale: 'fr-fr',
                          duration: '00:04:38',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example4.html',
                          source: 'tuto.com',
                          title: 'tuto4',
                        },
                        {
                          id: 'tuto5',
                          locale: 'en-us',
                          duration: '00:04:38',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example4.html',
                          source: 'tuto.com',
                          title: 'tuto4',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
      mockLearningContent(learningContentObjects);

      // when
      const tutorials = await getAllTutorials();

      // then
      expect(tutorials).to.be.lengthOf(5);
    });
  });

  describe('#getAllSkills', function () {
    it('should retrieve all skills', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent([
        {
          id: 'recArea1',
          titleFrFr: 'area1_Title',
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name: 'Fabriquer un meuble',
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      nom: '@web1',
                      challenges: [],
                      tutorialIds: ['tuto1', 'tuto2'],
                      tutorials: [
                        {
                          id: 'tuto1',
                          locale: 'fr-fr',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example.html',
                          source: 'tuto.com',
                          title: 'tuto1',
                        },
                        {
                          id: 'tuto2',
                          locale: 'fr-fr',
                          duration: '00:01:51',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example2.html',
                          source: 'tuto.com',
                          title: 'tuto2',
                        },
                      ],
                    },
                    {
                      id: 'recSkill2',
                      nom: '@web2',
                      challenges: [],
                      tutorialIds: ['tuto1'],
                      tutorials: [
                        {
                          id: 'tuto1',
                          locale: 'fr-fr',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example.html',
                          source: 'tuto.com',
                          title: 'tuto1',
                        },
                      ],
                    },
                    {
                      id: 'recSkill3',
                      nom: '@web3',
                      challenges: [],
                      tutorialIds: ['tuto4', 'tuto5'],
                      tutorials: [
                        {
                          id: 'tuto4',
                          locale: 'fr-fr',
                          duration: '00:04:38',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example4.html',
                          source: 'tuto.com',
                          title: 'tuto4',
                        },
                        {
                          id: 'tuto5',
                          locale: 'en-us',
                          duration: '00:04:38',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example5.html',
                          source: 'tuto.com',
                          title: 'tuto5',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
      mockLearningContent(learningContentObjects);

      // when
      const skills = await getAllSkills();

      // then
      expect(skills).to.be.lengthOf(3);
    });
  });

  describe('#associateSkillsToTutorial', function () {
    it('should associate skillIds to related tutorial', async function () {
      // given
      const tutorials = [
        domainBuilder.buildTutorial({ id: 'tutorial1_skill1_and_skill2' }),
        domainBuilder.buildTutorial({ id: 'tutorial2_skill1' }),
        domainBuilder.buildTutorial({ id: 'tutorial3_skill2' }),
      ];
      const skills = [
        domainBuilder.buildSkill({ id: 'skill1', tutorialIds: ['tutorial1_skill1_and_skill2', 'tutorial2_skill1'] }),
        domainBuilder.buildSkill({ id: 'skill2', tutorialIds: ['tutorial1_skill1_and_skill2', 'tutorial3_skill2'] }),
      ];

      // when
      const tutorialsWithSkillIds = associateSkillsToTutorial(skills, tutorials);

      // then
      expect(tutorialsWithSkillIds[0].skillIds).to.deep.equal(['skill1', 'skill2']);
      expect(tutorialsWithSkillIds[1].skillIds).to.deep.equal(['skill1']);
      expect(tutorialsWithSkillIds[2].skillIds).to.deep.equal(['skill2']);
    });
  });

  describe('#associateTutorialToUserSagedTutorial', function () {
    it('should retrieve one UserSavedTutorialWithTutorial', async function () {
      // given
      const tutorials = [domainBuilder.buildTutorial({ id: 'tuto1' }), domainBuilder.buildTutorial({ id: 'tuto2' })];
      const userSavedTutorial = domainBuilder.buildUserSavedTutorial({ tutorialId: 'tuto1' });

      // when
      const userSavedTutorialWithTutorial = associateTutorialToUserSavedTutorial(userSavedTutorial, tutorials);

      // then
      expect(userSavedTutorialWithTutorial).to.be.instanceOf(UserSavedTutorialWithTutorial);
      expect(userSavedTutorialWithTutorial.tutorial.id).to.equal(userSavedTutorial.tutorialId);
    });
  });

  describe('#getMostRelevantSkillId', function () {
    describe('when there is only one skillId in tutorial', function () {
      it('should return it', async function () {
        // given
        const tutorial = domainBuilder.buildTutorial();
        tutorial.skillIds = ['skill1'];
        const userSavedTutorialWithTutorial = domainBuilder.buildUserSavedTutorialWithTutorial({ tutorial });

        // when
        const skillId = await getMostRelevantSkillId(userSavedTutorialWithTutorial);

        // then
        expect(skillId).to.equal('skill1');
      });
    });

    describe('when there are skillIds in tutorial', function () {
      it('should return invalidate direct skill', async function () {
        // given
        const directInvalidatedSkillIdYoungest = 'directInvalidatedSkillYoungest';
        const directInvalidatedSkillIdOldest = 'directInvalidatedSkillOldest';
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: directInvalidatedSkillIdYoungest,
          createdAt: new Date('2022-03-18'),
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: directInvalidatedSkillIdOldest,
          createdAt: new Date('2022-03-16'),
        });
        await databaseBuilder.commit();
        const tutorial = domainBuilder.buildTutorial();
        tutorial.skillIds = ['skill1', 'skill2', directInvalidatedSkillIdOldest, directInvalidatedSkillIdYoungest];
        const userSavedTutorialWithTutorial = domainBuilder.buildUserSavedTutorialWithTutorial({
          userId,
          tutorial,
        });

        // when
        const skillId = await getMostRelevantSkillId(userSavedTutorialWithTutorial);

        // then
        expect(skillId).to.equal(directInvalidatedSkillIdYoungest);
      });

      describe('when user does not have invalidated direct knowledge element', function () {
        it('should return undefined', async function () {
          // given
          await databaseBuilder.commit();
          const tutorial = domainBuilder.buildTutorial();
          tutorial.skillIds = ['skill1', 'skill2'];
          const userSavedTutorialWithTutorial = domainBuilder.buildUserSavedTutorialWithTutorial({
            userId: 123,
            tutorial,
          });

          // when
          const result = await getMostRelevantSkillId(userSavedTutorialWithTutorial);

          // then
          expect(result).to.equal(undefined);
        });
      });
    });
  });
});
