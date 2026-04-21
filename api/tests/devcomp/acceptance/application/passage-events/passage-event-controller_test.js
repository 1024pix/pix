import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';

describe('Acceptance | Controller | passage-event-controller', function () {
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
              events: [
                {
                  type: 'FLASHCARDS_STARTED',
                  'occurred-at': 1556419320000,
                  'passage-id': passage.id,
                  'element-id': '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
                  'sequence-number': 1,
                },
              ],
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(204);

      const createdEvent = await knex('passage-events').where({ passageId: passage.id, sequenceNumber: 1 }).first();
      expect(createdEvent).to.not.be.undefined;
    });
  });
});
