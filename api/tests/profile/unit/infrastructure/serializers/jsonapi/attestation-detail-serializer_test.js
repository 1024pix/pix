import { AttestationDetail } from '../../../../../../src/profile/domain/models/AttestationDetail.js';
import { attestationDetailSerializer } from '../../../../../../src/profile/infrastructure/serializers/jsonapi/attestation-detail-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | attestation-detail', function () {
  describe('#serialize()', function () {
    it('should convert a scorecard object into JSON API data', function () {
      // when
      const json = attestationDetailSerializer.serialize([
        new AttestationDetail({ id: 45, key: 'POUET', obtainedAt: new Date('2020-01-05'), label: 'Pouet label' }),
        new AttestationDetail({
          id: 46,
          key: 'CACAHUETE',
          obtainedAt: new Date('2022-01-05'),
          label: 'Cacahuète label',
        }),
      ]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'attestation-details',
            id: '45',
            attributes: {
              key: 'POUET',
              'obtained-at': new Date('2020-01-05'),
              label: 'Pouet label',
            },
          },
          {
            type: 'attestation-details',
            id: '46',
            attributes: {
              key: 'CACAHUETE',
              'obtained-at': new Date('2022-01-05'),
              label: 'Cacahuète label',
            },
          },
        ],
      });
    });
  });
});
