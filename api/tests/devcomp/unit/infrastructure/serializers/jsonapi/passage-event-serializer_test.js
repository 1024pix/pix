import * as serializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/passage-event-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | PassageEventSerializer', function () {
  describe('#deserialize', function () {
    it('should convert JSON API data', async function () {
      // given
      const type = 'FLASHCARDS_STARTED';
      const occurredAt = 1556419320000;
      const passageId = 2;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

      const json = {
        data: {
          attributes: {
            'passage-events': [
              {
                elementId: elementId,
                'occurred-at': occurredAt,
                'passage-id': passageId,
                type,
              },
            ],
            type: 'passage-event-collection',
          },
        },
      };

      // when
      const results = await serializer.deserialize(json);

      // then
      expect(results).to.deep.equal([
        {
          elementId,
          occurredAt: new Date('2019-04-28T02:42:00Z'),
          passageId,
          type,
        },
      ]);
    });
  });
});
