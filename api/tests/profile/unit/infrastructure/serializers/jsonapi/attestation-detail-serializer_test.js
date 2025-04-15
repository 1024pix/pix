import { AttestationDetail } from '../../../../../../src/profile/domain/models/AttestationDetail.js';
import * as serializer from '../../../../../../src/profile/infrastructure/serializers/jsonapi/attestation-detail-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | attestation-detail', function () {
  describe('#serialize()', function () {
    it('should convert a scorecard object into JSON API data', function () {
      // when
      const json = serializer.serialize([
        new AttestationDetail({ id: 45, type: 'POUET', obtainedAt: new Date('2020-01-05') }),
        new AttestationDetail({ id: 46, type: 'CACAHUETE', obtainedAt: new Date('2022-01-05') }),
      ]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'attestation-details',
            id: '45',
            attributes: {
              type: 'POUET',
              'obtained-at': new Date('2020-01-05'),
            },
          },
          {
            type: 'attestation-details',
            id: '46',
            attributes: {
              type: 'CACAHUETE',
              'obtained-at': new Date('2022-01-05'),
            },
          },
        ],
      });
    });
  });
});
