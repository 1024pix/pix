const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');
const certificationPointOfContactController = require('../../../../lib/application/certification-point-of-contacts/certification-point-of-contact-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | certifications-point-of-contact-controller', () => {

  describe('#get', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'getCertificationPointOfContact');
    });

    it('should return a serialized CertificationReferent', async () => {
      // given
      const userId = 123;
      const certificationPointOfContact = domainBuilder.buildCertificationPointOfContact();
      const request = {
        auth: {
          credentials: { userId },
        },
      };
      usecases.getCertificationPointOfContact.withArgs({ userId }).resolves(certificationPointOfContact);

      // when
      const response = await certificationPointOfContactController.get(request, hFake);

      // then
      expect(response).to.deep.equal({
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
