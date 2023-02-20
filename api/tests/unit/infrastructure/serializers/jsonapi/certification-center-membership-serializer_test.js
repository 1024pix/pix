import { expect, domainBuilder } from '../../../../test-helper';
import certificationCenterMembershipSerializer from '../../../../../lib/infrastructure/serializers/jsonapi/certification-center-membership-serializer';

describe('Unit | Serializer | JSONAPI | certification-center-membership-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Certification Center Membership model object into JSON API data', function () {
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
      const serializedCertificationCenter = certificationCenterMembershipSerializer.serialize([
        certificationCenterMembership,
      ]);

      // then
      expect(serializedCertificationCenter).to.deep.equal(expectedSerializedCertificationCenter);
    });
  });

  describe('#serializeMembers', function () {
    it('should convert into JSON API data', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const user = domainBuilder.buildUser();
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        certificationCenter,
        user,
      });

      const expectedSerializedMember = {
        data: [
          {
            id: user.id.toString(),
            type: 'members',
            attributes: {
              'first-name': user.firstName,
              'last-name': user.lastName,
              'is-referer': certificationCenterMembership.isReferer,
            },
          },
        ],
      };

      // when
      const serializedMember = certificationCenterMembershipSerializer.serializeMembers([
        certificationCenterMembership,
      ]);

      // then
      expect(serializedMember).to.deep.equal(expectedSerializedMember);
    });
  });

  describe('#serializeForAdmin', function () {
    it('should convert into JSON API data', function () {
      // given
      const user = domainBuilder.buildUser();
      const certificationCenter = domainBuilder.buildCertificationCenter({
        name: 'Centre Shigeru',
        type: 'SCO',
        externalId: '12345ABC',
      });
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        certificationCenter,
        user,
      });

      // when
      const serializedCertificationCenterMembership = certificationCenterMembershipSerializer.serializeForAdmin([
        certificationCenterMembership,
      ]);

      // then
      expect(serializedCertificationCenterMembership).to.deep.equal({
        data: [
          {
            id: certificationCenterMembership.id.toString(),
            type: 'certification-center-memberships',
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
              'external-id': certificationCenter.externalId,
              name: certificationCenter.name,
              type: certificationCenter.type,
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
      });
    });
  });
});
