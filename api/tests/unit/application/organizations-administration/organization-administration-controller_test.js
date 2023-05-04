import { domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';
import { organizationController } from '../../../../lib/application/organizations-administration/organization-administration-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Application | Organizations | organization-administration-controller', function () {
  describe('#updateOrganizationInformation', function () {
    it('should return the serialized organization', async function () {
      // given
      const organizationAttributes = {
        id: 7,
        name: 'Acme',
        type: 'SCO',
        logoUrl: 'logo',
        externalId: '02A2145V',
        provinceCode: '02A',
        email: 'sco.generic.newaccount@example.net',
        credit: 50,
      };
      const tagAttributes = { id: '4', type: 'tags' };
      const request = {
        payload: {
          data: {
            id: organizationAttributes.id,
            attributes: {
              name: organizationAttributes.name,
              type: organizationAttributes.type,
              'logo-url': organizationAttributes.logoUrl,
              'external-id': organizationAttributes.externalId,
              'province-code': organizationAttributes.provinceCode,
              email: organizationAttributes.email,
              credit: organizationAttributes.credit,
            },
          },
          relationships: {
            tags: {
              data: [tagAttributes],
            },
          },
        },
      };
      const tagWithoutName = domainBuilder.buildTag({ id: tagAttributes.id, name: undefined });
      const tag = domainBuilder.buildTag({ id: tagAttributes.id, name: 'SCO' });
      const organizationDeserialized = domainBuilder.buildOrganization({
        ...organizationAttributes,
        tags: [tagWithoutName],
      });
      const updatedOrganization = domainBuilder.buildOrganization({
        ...organizationAttributes,
        tags: [tag],
      });
      const serializedOrganization = Symbol('the updated and serialized organization');

      sinon.stub(usecases, 'updateOrganizationInformation');
      const organizationForAdminSerializerStub = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };

      const dependencies = {
        organizationForAdminSerializer: organizationForAdminSerializerStub,
      };

      dependencies.organizationForAdminSerializer.deserialize
        .withArgs(request.payload)
        .returns(organizationDeserialized);
      usecases.updateOrganizationInformation
        .withArgs({ organization: organizationDeserialized })
        .resolves(updatedOrganization);
      dependencies.organizationForAdminSerializer.serialize
        .withArgs(updatedOrganization)
        .returns(serializedOrganization);

      // when
      const response = await organizationController.updateOrganizationInformation(request, hFake, dependencies);

      // then
      expect(response.source).to.deep.equal(serializedOrganization);
    });
  });

  describe('#getOrganizationDetails', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { id: organizationId } };

      const organizationDetails = Symbol('organizationDetails');
      const organizationDetailsSerialized = Symbol('organizationDetailsSerialized');
      sinon.stub(usecases, 'getOrganizationDetails').withArgs({ organizationId }).resolves(organizationDetails);
      const organizationForAdminSerializerStub = {
        serialize: sinon.stub(),
      };

      organizationForAdminSerializerStub.serialize.withArgs(organizationDetails).returns(organizationDetailsSerialized);

      const dependencies = {
        organizationForAdminSerializer: organizationForAdminSerializerStub,
      };

      // when
      const result = await organizationController.getOrganizationDetails(request, hFake, dependencies);

      // then
      expect(result).to.equal(organizationDetailsSerialized);
    });
  });
});
