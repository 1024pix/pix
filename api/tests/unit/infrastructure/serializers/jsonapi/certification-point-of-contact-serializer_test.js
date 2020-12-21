const { expect, domainBuilder } = require('../../../../test-helper');
const certificationPointOfContactSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-point-of-contact-serializer');

describe('Unit | Serializer | JSONAPI | certification-point-of-contact-serializer', () => {

  describe('#serialize()', () => {

    it('should convert a CertificationReferent model object into JSON API data', () => {
      // given
      const certificationPointOfContact = domainBuilder.buildCertificationPointOfContact();

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
            'certification-center-id': certificationPointOfContact.certificationCenterId,
            'certification-center-name': certificationPointOfContact.certificationCenterName,
            'certification-center-type': certificationPointOfContact.certificationCenterType,
            'certification-center-external-id': certificationPointOfContact.certificationCenterExternalId,
            'is-related-organization-managing-students': certificationPointOfContact.isRelatedOrganizationManagingStudents,
          },
          relationships: {
            sessions: {
              links: {
                related: `/api/certification-centers/${certificationPointOfContact.certificationCenterId}/sessions`,
              },
            },
          },
        },
      });
    });
  });
});
