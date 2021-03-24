const { expect, domainBuilder } = require('../../../../test-helper');
const certificationPointOfContactSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-point-of-contact-serializer');

describe('Unit | Serializer | JSONAPI | certification-point-of-contact-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a CertificationReferent model object into JSON API data', function() {
      // given
      const certificationCenter = { id: 1, name: 'Serre tiff', type: 'SCO', externalId: 'externalId', isRelatedOrganizationManagingStudents: false };
      const certificationPointOfContact = domainBuilder.buildCertificationPointOfContact({ certificationCenters: [certificationCenter] });

      // when
      const jsonApi = certificationPointOfContactSerializer.serialize(certificationPointOfContact);

      // then
      expect(jsonApi).to.deep.equal({
        data: {
          type: 'certification-point-of-contacts',
          id: certificationPointOfContact.id.toString(),
          attributes: {
            'first-name': certificationPointOfContact.firstName,
            'last-name': certificationPointOfContact.lastName,
            email: certificationPointOfContact.email,
            'pix-certif-terms-of-service-accepted': certificationPointOfContact.pixCertifTermsOfServiceAccepted,
            'current-certification-center-id': certificationPointOfContact.currentCertificationCenterId,
          },
          relationships: {
            'certification-centers': {
              data: [
                {
                  type: 'certificationCenters',
                  id: certificationCenter.id.toString(),
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'certificationCenters',
            id: certificationCenter.id.toString(),
            attributes: {
              name: certificationCenter.name,
              type: certificationCenter.type,
              'external-id': certificationCenter.externalId,
              'is-related-organization-managing-students': certificationCenter.isRelatedOrganizationManagingStudents,
            },
            relationships: {
              sessions: {
                links: {
                  related: `/api/certification-centers/${certificationCenter.id}/sessions`,
                },
              },
            },
          },
        ],
      });
    });
  });
});
