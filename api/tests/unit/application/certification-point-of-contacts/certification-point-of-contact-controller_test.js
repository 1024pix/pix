const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');
const certificationPointOfContactController = require('../../../../lib/application/certification-point-of-contacts/certification-point-of-contact-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | certifications-point-of-contact-controller', function() {

  describe('#get', function() {

    beforeEach(function() {
      sinon.stub(usecases, 'getCertificationPointOfContact');
    });

    it('should return a serialized CertificationReferent', async function() {
      // given
      const userId = 123;
      const certificationCenter = { id: 1, name: 'Serre tiff', type: 'SCO', externalId: 'externalId', isRelatedOrganizationManagingStudents: false };
      const certificationPointOfContact = domainBuilder.buildCertificationPointOfContact({ certificationCenters: [certificationCenter] });
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
