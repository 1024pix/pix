import sinon from 'sinon';

import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | organization', function () {
  describe('#addOrganizationFeatureInBatch', function () {
    let filePath, request, userId;

    beforeEach(function () {
      userId = Symbol('userId');
      filePath = Symbol('filePath');
      request = { payload: { path: filePath }, auth: { credentials: { userId } } };
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
        userId,
        filePath,
      });
    });
  });

  describe('#archiveOrganization', function () {
    it('calls the usecase to archive the organization with the user id', async function () {
      // given
      const organizationId = 1234;
      const userId = 10;
      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        params: { id: organizationId },
      };

      const archivedOrganization = Symbol('archivedOrganization');
      const archivedOrganizationSerialized = Symbol('archivedOrganizationSerialized');
      sinon.stub(usecases, 'archiveOrganization').resolves(archivedOrganization);
      const organizationForAdminSerializerStub = {
        serialize: sinon.stub(),
      };

      organizationForAdminSerializerStub.serialize
        .withArgs(archivedOrganization)
        .returns(archivedOrganizationSerialized);

      const dependencies = {
        organizationForAdminSerializer: organizationForAdminSerializerStub,
      };

      // when
      const response = await organizationAdminController.archiveOrganization(request, hFake, dependencies);

      // then
      expect(usecases.archiveOrganization).to.have.been.calledOnceWithExactly({ organizationId, userId });
      expect(response).to.deep.equal(archivedOrganizationSerialized);
    });
  });

  describe('#getOrganizationDetails', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { organizationId } };

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
      const adminUserId = Symbol('userId');
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
        auth: { credentials: { userId: adminUserId } },
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
        .withArgs({ userId: adminUserId, organization: organizationDeserialized })
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

  describe('#getOrganizationPlacesStatistics', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { organizationId } };

      const organizationPlacesStatistics = Symbol('organizationPlaces');
      const organizationPlacesStatisticsSerialized = Symbol('organizationPlacesSerialized');
      sinon
        .stub(usecases, 'getOrganizationPlacesStatistics')
        .withArgs({ organizationId })
        .resolves(organizationPlacesStatistics);
      const organizationPlacesStatisticsSerializerStub = {
        serialize: sinon.stub(),
      };

      organizationPlacesStatisticsSerializerStub.serialize
        .withArgs(organizationPlacesStatistics)
        .returns(organizationPlacesStatisticsSerialized);

      const dependencies = {
        organizationPlacesStatisticsSerializer: organizationPlacesStatisticsSerializerStub,
      };

      // when
      const result = await organizationAdminController.getOrganizationPlacesStatistics(request, hFake, dependencies);

      // then
      expect(result).to.equal(organizationPlacesStatisticsSerialized);
    });
  });

  describe('#getOrganizationStatistics', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { organizationId } };

      const organizationStatistics = Symbol('statistics');
      const organizationStatisticsSerialized = Symbol('serializedStatistics');
      sinon.stub(usecases, 'getOrganizationStatistics').withArgs({ organizationId }).resolves(organizationStatistics);
      const organizationStatisticsSerializerStub = {
        serialize: sinon.stub(),
      };

      organizationStatisticsSerializerStub.serialize
        .withArgs(organizationStatistics)
        .returns(organizationStatisticsSerialized);

      const dependencies = {
        organizationStatisticsSerializer: organizationStatisticsSerializerStub,
      };

      // when
      const result = await organizationAdminController.getOrganizationStatistics(request, hFake, dependencies);

      // then
      expect(result).to.equal(organizationStatisticsSerialized);
    });
  });
});
