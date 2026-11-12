import { expect } from 'chai';

import { creditsLotSerializer } from '../../../../../../../src/organizational-entities/infrastructure/credits/serializers/jsonapi/credits-lot-serializer.js';

describe('Unit | Serializer | Credits | credits-lot-serializer', function () {
  describe('#serialize', function () {
    it('should return the created id', function () {
      // given
      const creditsLotId = 1234;

      // when
      const serializedcreditsLot = creditsLotSerializer.serialize({ id: creditsLotId });

      // then
      expect(serializedcreditsLot).to.deep.equal({
        data: {
          id: `${creditsLotId}`,
          type: 'credits-lots',
        },
      });
    });
  });

  describe('#deserialize', function () {
    it('convert creditsLots from JSON:API to camelCase format', async function () {
      // given
      const payload = {
        data: {
          id: 123,
          type: 'credits-lots',
          attributes: {
            count: 50,
            'activation-date': '2026-01-01',
            'expiration-date': '2027-01-01',
            reference: 'ABCDEF',
          },
        },
      };

      // when
      const attributes = await creditsLotSerializer.deserialize(payload);

      // then
      expect(attributes).to.deep.equal({
        id: 123,
        count: 50,
        activationDate: '2026-01-01',
        expirationDate: '2027-01-01',
        reference: 'ABCDEF',
      });
    });
  });
});
