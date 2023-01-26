const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const settings = require('../../../../../lib/config');
const certificationPointOfContactSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-point-of-contact-serializer');

describe('Unit | Serializer | JSONAPI | certification-point-of-contact-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a CertificationPointOfContact model into JSON API data', function () {
      // given
      sinon.stub(settings.features, 'pixCertifScoBlockedAccessDateCollege').value('2022-06-01');
      sinon.stub(settings.features, 'pixCertifScoBlockedAccessDateLycee').value('2022-08-01');

      settings.features.pixCertifScoBlockedAccessDateLycee = '2022-08-01';
      const allowedCertificationCenterAccess1 = domainBuilder.buildAllowedCertificationCenterAccess({
        id: 123,
        name: 'Sunnydale Center',
        externalId: 'BUFFY_SLAYER',
        type: 'PRO',
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: [],
        habilitations: [
          { id: 1, name: 'Certif comp 1' },
          { id: 2, name: 'Certif comp 2' },
        ],
      });
      const allowedCertificationCenterAccess2 = domainBuilder.buildAllowedCertificationCenterAccess({
        id: 456,
        name: 'Hellmouth',
        externalId: 'SPIKE',
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['tag1'],
        habilitations: [],
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
              'pix-certif-sco-blocked-access-date-college': '2022-06-01',
              'pix-certif-sco-blocked-access-date-lycee': '2022-08-01',
              'related-organization-tags': [],
              habilitations: [
                { id: 1, name: 'Certif comp 1' },
                { id: 2, name: 'Certif comp 2' },
              ],
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
              'pix-certif-sco-blocked-access-date-college': '2022-06-01',
              'pix-certif-sco-blocked-access-date-lycee': '2022-08-01',
              'related-organization-tags': ['tag1'],
              habilitations: [],
            },
          },
        ],
      });
    });
  });
});
