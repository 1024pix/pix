import { Attestation } from '../../../../../../src/profile/domain/models/Attestation.js';
import { attestationSerializer } from '../../../../../../src/profile/infrastructure/serializers/jsonapi/attestation-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Profile | Unit | Serializer | JSONAPI | attestation', function () {
  describe('#serialize()', function () {
    it('should convert attestation objects into JSON API data', function () {
      // when
      const json = attestationSerializer.serialize([
        new Attestation({ id: 1, key: 'PARENTHOOD', templateName: 'template-parenthood', label: 'Parentalité' }),
        new Attestation({ id: 2, key: 'SIXTH_GRADE', templateName: 'template-sixth-grade', label: '6ème' }),
      ]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'attestations',
            id: '1',
            attributes: {
              key: 'PARENTHOOD',
              label: 'Parentalité',
            },
          },
          {
            type: 'attestations',
            id: '2',
            attributes: {
              key: 'SIXTH_GRADE',
              label: '6ème',
            },
          },
        ],
      });
    });
  });
});
