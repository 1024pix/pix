import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | organization', function () {
  describe('#addOrganizationFeatureInBatch', function () {
    let filePath, request;

    beforeEach(function () {
      filePath = Symbol('filePath');
      request = { payload: { path: filePath } };
      sinon.stub(usecases, 'addOrganizationFeatureInBatch').resolves();
    });

    it('calls the usecase to create organization feature', async function () {
      // given
      hFake.request = {
        path: '/api/admin/organizations/add-multiple-organization-features',
      };

      // when
      await organizationAdminController.addOrganizationFeatureInBatch(request, hFake);

      // then
      expect(usecases.addOrganizationFeatureInBatch).to.have.been.calledWithExactly({
        filePath,
      });
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
      const result = await organizationAdminController.getOrganizationDetails(request, hFake, dependencies);

      // then
      expect(result).to.equal(organizationDetailsSerialized);
    });
  });

  describe('#updateOrganizationsInBatch', function () {
    let filePath, request;

    beforeEach(function () {
      filePath = Symbol('filePath');
      request = { payload: { path: filePath } };
      sinon.stub(usecases, 'updateOrganizationsInBatch').resolves();
    });

    it('calls the usecase to update organizations', async function () {
      // given
      hFake.request = {
        path: '/api/admin/organizations/update-organizations',
      };

      // when
      await organizationAdminController.updateOrganizationsInBatch(request, hFake);

      // then
      expect(usecases.updateOrganizationsInBatch).to.have.been.calledWithExactly({
        filePath,
      });
    });
  });

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
      const domainTransaction = Symbol('domainTransaction');
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback(domainTransaction);
      });

      dependencies.organizationForAdminSerializer.deserialize
        .withArgs(request.payload)
        .returns(organizationDeserialized);
      usecases.updateOrganizationInformation
        .withArgs({ organization: organizationDeserialized, domainTransaction })
        .resolves(updatedOrganization);
      dependencies.organizationForAdminSerializer.serialize
        .withArgs(updatedOrganization)
        .returns(serializedOrganization);

      // when
      const response = await organizationAdminController.updateOrganizationInformation(request, hFake, dependencies);

      // then
      expect(response.source).to.deep.equal(serializedOrganization);
    });
  });
});
