import { expect } from 'chai';

import { organizationCreditsLotSerializer } from '../../../../../../../src/organizational-entities/infrastructure/credits/serializers/jsonapi/organization-credits-lot-serializer.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | Credits | organization-credits-lot-serializer', function () {
  describe('#serialize', function () {
    it('converts organization credits lots to JSON:API with their consumptions', function () {
      // given
      const creditsLot = domainBuilder.acquisition.buildOrganizationCreditsLot({
        id: 12,
        count: 10,
        activationDate: new Date('2026-01-01'),
        expirationDate: new Date('2999-12-31'),
        reference: 'REF-12',
        consumptions: [
          {
            organizationLearnerId: 7,
            firstName: 'Lucie',
            lastName: 'Fer',
            consumedAt: new Date('2026-02-01'),
          },
        ],
      });

      // when
      const json = organizationCreditsLotSerializer.serialize([creditsLot]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            id: '12',
            type: 'organization-credits-lots',
            attributes: {
              count: 10,
              'consumed-count': 1,
              'available-count': 9,
              'activation-date': new Date('2026-01-01'),
              'expiration-date': new Date('2999-12-31'),
              reference: 'REF-12',
              status: 'ACTIVE',
              consumptions: [
                {
                  'organization-learner-id': 7,
                  'first-name': 'Lucie',
                  'last-name': 'Fer',
                  'consumed-at': new Date('2026-02-01'),
                },
              ],
            },
          },
        ],
      });
    });
  });
});
