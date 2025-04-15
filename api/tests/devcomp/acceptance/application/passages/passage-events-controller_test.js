import { createServer, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Acceptance | Controller | passage-events-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/passages-events', function () {
    it('should create a new passage event and response with a 201', async function () {
      // given
      const passage = databaseBuilder.factory.buildPassage();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/passage-events',
        payload: {
          data: {
            type: 'passage-event-collection',
            attributes: {
              'passage-events': [
                {
                  type: 'FLASHCARDS_STARTED',
                  'occurred-at': 1556419320000,
                  'passage-id': passage.id,
                  'element-id': '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
                },
              ],
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);

      const createdEvent = await knex('passage-events').where({ passageId: passage.id }).first();
      expect(createdEvent).to.not.be.undefined;
    });
  });
});
