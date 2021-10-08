const { expect, domainBuilder } = require('../../../../test-helper');
const certificationPointOfContactSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-point-of-contact-serializer');

describe('Unit | Serializer | JSONAPI | certification-point-of-contact-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a CertificationPointOfContact model into JSON API data', function () {
      // given
      const allowedCertificationCenterAccess1 = domainBuilder.buildAllowedCertificationCenterAccess({
        id: 123,
        name: 'Sunnydale Center',
        externalId: 'BUFFY_SLAYER',
        type: 'PRO',
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: [],
      });
      const allowedCertificationCenterAccess2 = domainBuilder.buildAllowedCertificationCenterAccess({
        id: 456,
        name: 'Hellmouth',
        externalId: 'SPIKE',
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['tag1'],
      });
      const certificationPointOfContact = domainBuilder.buildCertificationPointOfContact({
        id: 789,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'buffy.summers@example.net',
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess1, allowedCertificationCenterAccess2],
      });

      // when
      const jsonApi = certificationPointOfContactSerializer.serialize(certificationPointOfContact);

      // then
      expect(jsonApi).to.deep.equal({
        data: {
          id: '789',
          type: 'certification-point-of-contact',
          attributes: {
            'first-name': 'Buffy',
            'last-name': 'Summers',
            email: 'buffy.summers@example.net',
            'pix-certif-terms-of-service-accepted': true,
          },
          relationships: {
            'allowed-certification-center-accesses': {
              data: [
                {
                  id: '123',
                  type: 'allowed-certification-center-access',
                },
                {
                  id: '456',
                  type: 'allowed-certification-center-access',
                },
              ],
            },
          },
        },
        included: [
          {
            id: '123',
            type: 'allowed-certification-center-access',
            attributes: {
              name: 'Sunnydale Center',
              'external-id': 'BUFFY_SLAYER',
              type: 'PRO',
              'is-related-to-managing-students-organization': false,
              'is-access-blocked-college': false,
              'is-access-blocked-lycee': false,
              'is-access-blocked-aefe': false,
              'is-access-blocked-agri': false,
              'related-organization-tags': [],
            },
          },
          {
            id: '456',
            type: 'allowed-certification-center-access',
            attributes: {
              name: 'Hellmouth',
              'external-id': 'SPIKE',
              type: 'SCO',
              'is-related-to-managing-students-organization': true,
              'is-access-blocked-college': false,
              'is-access-blocked-lycee': false,
              'is-access-blocked-aefe': false,
              'is-access-blocked-agri': false,
              'related-organization-tags': ['tag1'],
            },
          },
        ],
      });
    });
  });
});
