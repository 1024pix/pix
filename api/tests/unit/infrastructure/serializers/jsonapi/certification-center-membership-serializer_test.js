const { expect } = require('../../../../test-helper');
const certificationCenterMembershipSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const CertificationCenterMembership = require('../../../../../lib/domain/models/CertificationCenterMembership');
const CertificationCenter = require('../../../../../lib/domain/models/CertificationCenter');

describe('Unit | Serializer | JSONAPI | certification-center-membership-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Certification Center Membership model object into JSON API data', function() {
      // given
      const certificationCenter = new CertificationCenter({ id: 1, name: 'certifCenter' });

      const certificationCenterMembership = new CertificationCenterMembership({
        id: 1,
        certificationCenter,
      });

      const expectedSerializedCertificationCenter = {
        data: [
          {
            attributes: {},
            id: '1',
            relationships: {
              'certification-center': {
                data: {
                  id: '1',
                  type: 'certificationCenters',
                }
              }
            },
            type: 'certificationCenterMemberships',
          }
        ],
        included: [
          {
            attributes: {
              name: 'certifCenter'
            },
            id: '1',
            relationships: {
              sessions: {
                links: {
                  related: '/api/certification-centers/1/sessions'
                }
              }
            },
            type: 'certificationCenters'
          }
        ]
      };

      // when
      const serializedCertificationCenter = certificationCenterMembershipSerializer.serialize([certificationCenterMembership]);

      // then
      expect(serializedCertificationCenter).to.deep.equal(expectedSerializedCertificationCenter);
    });

  });

});
