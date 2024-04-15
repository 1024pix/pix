import { KnowledgeElement } from '../../../../../lib/domain/models/KnowledgeElement.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | user-tutorial-controller', function () {
  const userId = 4444;
  let server;

  beforeEach(async function () {
    server = await createServer();

    databaseBuilder.factory.buildUser({
      id: userId,
      firstName: 'Classic',
      lastName: 'Papa',
      email: 'classic.papa@example.net',
      password: 'abcd1234',
    });

    await databaseBuilder.commit();
  });

  describe('PUT /api/users/tutorials/{tutorialId}', function () {
    let options;
    const learningContent = {
      skills: [
        {
          id: 'skillId',
          challenges: [{ id: 'k_challenge_id' }],
        },
      ],
      tutorials: [
        {
          id: 'tutorialId',
          locale: 'en-us',
          duration: '00:03:31',
          format: 'vidéo',
          link: 'http://www.example.com/this-is-an-example.html',
          source: 'Source Example, Example',
          title: 'Communiquer',
        },
      ],
    };

    beforeEach(function () {
      options = {
        method: 'PUT',
        url: '/api/users/tutorials/tutorialId',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      mockLearningContent(learningContent);
    });

    describe('nominal case', function () {
      it('should respond with a 201 and return user-tutorial created', async function () {
        // given
        const expectedUserSavedTutorial = {
          data: {
            type: 'user-saved-tutorials',
            id: '1',
            attributes: {
              'tutorial-id': 'tutorialId',
              'user-id': userId,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.deep.equal(expectedUserSavedTutorial.data.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes['user-id']).to.deep.equal(
          expectedUserSavedTutorial.data.attributes['user-id'],
        );
        expect(response.result.data.attributes['tutorial-id']).to.deep.equal(
          expectedUserSavedTutorial.data.attributes['tutorial-id'],
        );
      });

      describe('when skill id is given', function () {
        it('should respond with a 201 and return user-saved-tutorial created', async function () {
          // given
          options.payload = { data: { attributes: { 'skill-id': 'skillId' } } };
          const expectedUserSavedTutorial = {
            data: {
              type: 'user-saved-tutorials',
              id: '1',
              attributes: {
                'skill-id': 'skillId',
                'tutorial-id': 'tutorialId',
                'user-id': userId,
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.type).to.deep.equal(expectedUserSavedTutorial.data.type);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['user-id']).to.deep.equal(
            expectedUserSavedTutorial.data.attributes['user-id'],
          );
          expect(response.result.data.attributes['tutorial-id']).to.deep.equal(
            expectedUserSavedTutorial.data.attributes['tutorial-id'],
          );
          expect(response.result.data.attributes['skill-id']).to.deep.equal(
            expectedUserSavedTutorial.data.attributes['skill-id'],
          );
        });
      });
    });

    describe('error cases', function () {
      it('should respond with a 404 - not found when tutorialId does not exist', async function () {
        // given
        options.url = '/api/users/tutorials/badId';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('GET /api/users/{userId}/tutorials', function () {
    let options;
    let learningContentObjects;

    beforeEach(async function () {
      options = {
        method: 'GET',
        url: `/api/users/${userId}/tutorials?filter[competences]=recCompetence1&filter[type]=saved`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      learningContentObjects = learningContentBuilder.fromAreas([
        {
          id: 'recArea1',
          title_i18n: {
            fr: 'area1_Title',
          },
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
                          locale: 'en-us',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example.html',
                          source: 'tuto.com',
                          title: 'tuto1',
                        },
                        {
                          id: 'tuto2',
                          locale: 'en-us',
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
                      tutorialIds: ['tuto3'],
                      tutorials: [
                        {
                          id: 'tuto3',
                          locale: 'fr-fr',
                          duration: '00:03:31',
                          format: 'vidéo',
                          link: 'http://www.example.com/this-is-an-example3.html',
                          source: 'tuto.com',
                          title: 'tuto3',
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
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence2',
              name: 'Fabriquer une table',
              index: '1.2',
              tubes: [
                {
                  id: 'recTube3',
                  skills: [
                    {
                      id: 'recSkill4',
                      nom: '@table2',
                      challenges: [],
                      tutorialIds: ['tuto6', 'tuto7'],
                      tutorials: [
                        {
                          id: 'tuto6',
                          locale: 'fr-fr',
                          duration: '00:00:54',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example6.html',
                          source: 'tuto.com',
                          title: 'tuto6',
                        },
                        {
                          id: 'tuto7',
                          locale: 'fr-fr',
                          duration: '00:01:51',
                          format: 'video',
                          link: 'http://www.example.com/this-is-an-example7.html',
                          source: 'tuto.com',
                          title: 'tuto7',
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
    });

    describe('nominal case', function () {
      it('should respond with a 200 and return tutorials saved for user', async function () {
        // given
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildUserSavedTutorial({
          id: 101,
          userId,
          tutorialId: 'tuto1',
          skillId: 'skill123',
        });

        databaseBuilder.factory.buildUserSavedTutorial({
          id: 102,
          userId,
          tutorialId: 'tuto6',
          skillId: 'recSkill4',
        });

        await databaseBuilder.commit();

        const expectedUserSavedTutorials = [
          {
            attributes: {
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'tuto.com',
              title: 'tuto1',
              'skill-id': 'skill123',
            },
            relationships: {
              'user-saved-tutorial': { data: { id: '101', type: 'user-saved-tutorial' } },
              'tutorial-evaluation': {
                data: null,
              },
            },
            id: 'tuto1',
            type: 'tutorials',
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedUserSavedTutorials);
        expect(response.result.meta.pagination).to.deep.equal({
          page: 1,
          pageSize: 10,
          rowCount: 1,
          pageCount: 1,
        });
      });

      it('should respond with a 200 and return tutorials recommended for user', async function () {
        // given
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'recSkill1',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.VALIDATED,
          source: KnowledgeElement.SourceType.INFERRED,
          skillId: 'recSkill2',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'recSkill3',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'recSkill4',
        });

        await databaseBuilder.commit();

        const expectedTutorials = [
          {
            attributes: {
              duration: '00:04:38',
              format: 'vidéo',
              link: 'http://www.example.com/this-is-an-example4.html',
              'skill-id': 'recSkill3',
              source: 'tuto.com',
              title: 'tuto4',
            },
            id: 'tuto4',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-saved-tutorial': {
                data: null,
              },
            },
            type: 'tutorials',
          },
          {
            attributes: {
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example6.html',
              'skill-id': 'recSkill4',
              source: 'tuto.com',
              title: 'tuto6',
            },
            id: 'tuto6',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-saved-tutorial': {
                data: null,
              },
            },
            type: 'tutorials',
          },
          {
            attributes: {
              duration: '00:01:51',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example7.html',
              'skill-id': 'recSkill4',
              source: 'tuto.com',
              title: 'tuto7',
            },
            id: 'tuto7',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-saved-tutorial': {
                data: null,
              },
            },
            type: 'tutorials',
          },
        ];

        options.url = `/api/users/${userId}/tutorials?filter[type]=recommended`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedTutorials);
        expect(response.result.meta.pagination).to.deep.equal({
          page: 1,
          pageSize: 10,
          rowCount: 3,
          pageCount: 1,
        });
      });
    });
  });

  describe('DELETE /api/users/tutorials/{tutorialId}', function () {
    let options;
    const learningContent = {
      skills: [
        {
          id: 'skillId',
          challenges: [{ id: 'k_challenge_id' }],
        },
      ],
      tutorials: [
        {
          id: 'tutorialId',
          locale: 'en-us',
          duration: '00:03:31',
          format: 'vidéo',
          link: 'http://www.example.com/this-is-an-example.html',
          source: 'Source Example, Example',
          title: 'Communiquer',
        },
      ],
    };

    beforeEach(function () {
      options = {
        method: 'DELETE',
        url: '/api/users/tutorials/tutorialId',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      mockLearningContent(learningContent);
    });

    describe('nominal case', function () {
      it('should respond with a 204', async function () {
        // given
        databaseBuilder.factory.buildUserSavedTutorial({ userId, tutorialId: 'tutorialId' });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
