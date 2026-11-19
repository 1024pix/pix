import { expect } from 'chai';

import { creditsLotSerializer } from '../../../../../../../src/organizational-entities/infrastructure/credits/serializers/jsonapi/credits-lot-serializer.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | Credits | credits-lot-serializer', function () {
  describe('#serialize', function () {
    it('converts a credits lot model to JSON', function () {
      // given
      const creditsLot = domainBuilder.acquisition.buildCreditsLot();

      const expectedSerializedCreditsLot = {
        data: {
          id: creditsLot.id.toString(),
          type: 'credits-lots',
          attributes: {
            'structure-id': creditsLot.structureId,
            count: creditsLot.count,
            'activation-date': creditsLot.activationDate,
            'expiration-date': creditsLot.expirationDate,
            reference: creditsLot.reference,
            'creator-full-name': creditsLot.creatorFullName,
            status: creditsLot.status,
          },
        },
      };

      // when
      const json = creditsLotSerializer.serialize(creditsLot);
      // then
      expect(json).to.deep.equal(expectedSerializedCreditsLot);
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
