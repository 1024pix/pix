import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/mission-serializer.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | mission-serializer', function () {
  describe('#serialize', function () {
    it('should convert a mission model to JSON', function () {
      // given
      const mission = domainBuilder.buildMission({ name: 'TAG1' });

      const expectedSerializedMission = {
        data: {
          attributes: {
            name: mission.name,
          },
          id: mission.id.toString(),
          type: 'missions',
        },
      };

      // when
      const json = serializer.serialize(mission);

      // then
      expect(json).to.deep.equal(expectedSerializedMission);
    });
  });
});
