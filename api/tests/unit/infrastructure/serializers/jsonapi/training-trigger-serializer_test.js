const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/training-trigger-serializer');

describe('Unit | Serializer | JSONAPI | training-trigger-serializer', function () {
  describe('#serialize', function () {
    it('should convert a training trigger model to JSON', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTrigger();

      const expectedSerializedTraining = {
        data: {
          attributes: {
            'training-id': trainingTrigger.trainingId,
            threshold: trainingTrigger.threshold,
            type: trainingTrigger.type,
          },
          relationships: {
            tubes: {
              data: [
                {
                  id: 'recTube123',
                  type: 'tubes',
                },
              ],
            },
          },
          id: trainingTrigger.id.toString(),
          type: 'training-triggers',
        },
        included: [
          {
            attributes: {
              id: 'recTube123',
              level: 2,
            },
            id: 'recTube123',
            type: 'tubes',
          },
        ],
      };

      // when
      const json = serializer.serialize(trainingTrigger);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to Training Trigger object', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'training-triggers',
          attributes: {
            trainingId: 123,
            type: 'prerequisite',
            threshold: 30,
            tubes: [{ id: 'recTube123', level: 2 }],
          },
        },
      };

      // when
      const trainingTrigger = await serializer.deserialize(jsonTraining);

      // then
      expect(trainingTrigger).to.deep.equal({
        trainingId: 123,
        type: 'prerequisite',
        threshold: 30,
        tubes: [{ id: 'recTube123', level: 2 }],
      });
    });
  });
});
