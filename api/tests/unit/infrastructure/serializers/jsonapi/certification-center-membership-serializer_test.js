const { expect, domainBuilder } = require('../../../../test-helper');
const certificationCenterMembershipSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-center-membership-serializer');

describe('Unit | Serializer | JSONAPI | certification-center-membership-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Certification Center Membership model object into JSON API data', function() {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const user = domainBuilder.buildUser();
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        certificationCenter,
        user,
      });

      const expectedSerializedCertificationCenter = {
        data: [
          {
            id: certificationCenterMembership.id.toString(),
            type: 'certificationCenterMemberships',
            attributes: {
              'created-at': certificationCenterMembership.createdAt,
            },
            relationships: {
              'certification-center': {
                data: {
                  id: certificationCenter.id.toString(),
                  type: 'certificationCenters',
                },
              },
              user: {
                data: {
                  id: user.id.toString(),
                  type: 'users',
                },
              },
            },
          },
        ],
        included: [
          {
            id: certificationCenter.id.toString(),
            type: 'certificationCenters',
            attributes: {
              name: certificationCenter.name,
              type: certificationCenter.type,
            },
            relationships: {
              sessions: {
                links: {
                  related: `/api/certification-centers/${certificationCenter.id}/sessions`,
                },
              },
            },
          },
          {
            id: user.id.toString(),
            type: 'users',
            attributes: {
              'first-name': user.firstName,
              'last-name': user.lastName,
              email: user.email,
            },
          },
        ],
      };

      // when
      const serializedCertificationCenter = certificationCenterMembershipSerializer.serialize([certificationCenterMembership]);

      // then
      expect(serializedCertificationCenter).to.deep.equal(expectedSerializedCertificationCenter);
    });
  });

});
