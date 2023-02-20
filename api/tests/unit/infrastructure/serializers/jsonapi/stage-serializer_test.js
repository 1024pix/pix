import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/stage-serializer';

describe('Unit | Serializer | JSONAPI | stage-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Stage model object into JSON API data', function () {
      // given
      const stage = domainBuilder.buildStage({
        id: '1',
        message: 'Congrats, you won a banana stage',
        targetProfileId: '1',
        threshold: 42,
        title: 'Banana',
        prescriberTitle: 'Palier intermédiaire',
        prescriberDescription: 'Le participant a un niveau moyen',
      });

      const expectedSerializedStage = {
        data: {
          attributes: {
            message: 'Congrats, you won a banana stage',
            threshold: 42,
            level: null,
            title: 'Banana',
            'prescriber-title': stage.prescriberTitle,
            'prescriber-description': stage.prescriberDescription,
          },
          id: '1',
          type: 'stages',
        },
      };

      // when
      const json = serializer.serialize(stage);

      // then
      expect(json).to.deep.equal(expectedSerializedStage);
    });
  });
});
