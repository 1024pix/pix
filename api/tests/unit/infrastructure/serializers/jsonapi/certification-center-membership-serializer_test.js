const { expect, domainBuilder } = require('../../../../test-helper');
const certificationCenterMembershipSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-center-membership-serializer');

describe('Unit | Serializer | JSONAPI | certification-center-membership-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Certification Center Membership model object into JSON API data', function() {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({ certificationCenter });

      const expectedSerializedCertificationCenter = {
        data: [
          {
            attributes: {},
            id: certificationCenterMembership.id.toString(),
            relationships: {
              'certification-center': {
                data: {
                  id: certificationCenter.id.toString(),
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
              name: certificationCenter.name,
              type: certificationCenter.type,
            },
            id: certificationCenter.id.toString(),
            relationships: {
              sessions: {
                links: {
                  related: `/api/certification-centers/${certificationCenter.id}/sessions`,
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
