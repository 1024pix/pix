import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/sco-blocked-access-dates-serializer.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Serializer | sco-blocked-access-dates-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a sco blocked access dates to JSONAPI', function () {
      // given
      const scoBlockedAccessDates = [
        domainBuilder.certification.configuration.buildScoBlockedAccessDateLycee(),
        domainBuilder.certification.configuration.buildScoBlockedAccessDateCollege(),
      ];

      // when
      const serializedScoBlockedAccessDates = serializer.serialize(scoBlockedAccessDates);

      // then
      expect(serializedScoBlockedAccessDates).to.deep.equal({
        data: [
          {
            type: 'sco-blocked-access-dates',
            id: 'LYCEE',
            attributes: {
              'reopening-date': new Date('2025-10-15'),
            },
          },
          {
            type: 'sco-blocked-access-dates',
            id: 'COLLEGE',
            attributes: {
              'reopening-date': new Date('2025-11-15'),
            },
          },
        ],
      });
    });
  });
});
