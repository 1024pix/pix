import { organizationPlaceController } from '../../../../../src/prescription/organization-place/application/organization-place-controller.js';
import { usecases } from '../../../../../src/prescription/organization-place/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | organization-place-controller', function () {
  describe('#findOrganizationPlacesLot', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { id: organizationId } };

      const organizationPlaces = Symbol('organizationPlaces');
      const organizationPlacesSerialized = Symbol('organizationPlacesSerialized');
      sinon.stub(usecases, 'findOrganizationPlacesLot').withArgs({ organizationId }).resolves(organizationPlaces);
      const organizationPlacesLotManagementSerializerStub = {
        serialize: sinon.stub(),
      };

      organizationPlacesLotManagementSerializerStub.serialize
        .withArgs(organizationPlaces)
        .returns(organizationPlacesSerialized);

      const dependencies = {
        organizationPlacesLotManagementSerializer: organizationPlacesLotManagementSerializerStub,
      };

      // when
      const result = await organizationPlaceController.findOrganizationPlacesLot(request, hFake, dependencies);

      // then
      expect(result).to.equal(organizationPlacesSerialized);
    });
  });

  describe('#getOrganizationPlacesStatistics', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { id: organizationId } };

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
      const result = await organizationPlaceController.getOrganizationPlacesStatistics(request, hFake, dependencies);

      // then
      expect(result).to.equal(organizationPlacesStatisticsSerialized);
    });
  });

  describe('#createOrganizationPlacesLot', function () {
    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'createOrganizationPlacesLot');
      const organizationPlacesLotManagementSerializerStub = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };

      dependencies = {
        organizationPlacesLotManagementSerializer: organizationPlacesLotManagementSerializerStub,
      };
    });

    context('successful case', function () {
      it('should create a lot of organization places', async function () {
        // given
        const OrganizationPlacesLotToCreate = domainBuilder.buildOrganizationPlacesLot();

        const createdBy = Symbol('createdBy');
        const organizationId = Symbol('organizationId');
        const organizationPlacesLotData = Symbol('organizationPlacesLotData');
        const organizationPlacesLot = Symbol('organizationPlacesLot');
        const organizationPlacesLotSerialized = Symbol('OrganizationPlacesSetSerlialized');

        const request = {
          params: {
            id: organizationId,
          },
          auth: { credentials: { accessToken: 'valid.access.token', userId: createdBy } },
          payload: {
            data: {
              attributes: {
                'organization-id': OrganizationPlacesLotToCreate.organizationId,
                count: OrganizationPlacesLotToCreate.count,
                'activation-date': OrganizationPlacesLotToCreate.activationDate,
                'expiration-date': OrganizationPlacesLotToCreate.expirationDate,
                reference: OrganizationPlacesLotToCreate.reference,
                category: OrganizationPlacesLotToCreate.category,
                'created-by': OrganizationPlacesLotToCreate.createdBy,
              },
            },
          },
        };

        dependencies.organizationPlacesLotManagementSerializer.deserialize
          .withArgs(request.payload)
          .returns(organizationPlacesLotData);
        usecases.createOrganizationPlacesLot
          .withArgs({
            organizationPlacesLotData,
            organizationId,
            createdBy,
          })
          .returns(organizationPlacesLot);
        dependencies.organizationPlacesLotManagementSerializer.serialize
          .withArgs(organizationPlacesLot)
          .returns(organizationPlacesLotSerialized);

        // when
        const response = await organizationPlaceController.createOrganizationPlacesLot(request, hFake, dependencies);
        // then
        expect(response.source).to.be.equal(organizationPlacesLotSerialized);
      });
    });
  });

  describe('#getDataOrganizationsPlacesStatistics', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const request = {};
      const dataOrganizationPlacesStatistics = Symbol('dataOrganizationPlacesStatistics');
      const dataOrganizationPlacesStatisticsSerialized = Symbol('dataOrganizationPlacesStatisticsSerialized');

      const getOrganizationPlacesStatisticsStub = sinon.stub();
      const findPaginatedFilteredOrganizationsStub = sinon.stub();

      sinon.stub(usecases, 'getDataOrganizationsPlacesStatistics');

      usecases.getDataOrganizationsPlacesStatistics
        .withArgs({
          getOrganizationPlacesStatistics: getOrganizationPlacesStatisticsStub,
          findPaginatedFilteredOrganizations: findPaginatedFilteredOrganizationsStub,
        })
        .resolves(dataOrganizationPlacesStatistics);

      const dataOrganizationPlacesStatisticsSerializerStub = {
        serialize: sinon.stub(),
      };

      dataOrganizationPlacesStatisticsSerializerStub.serialize
        .withArgs(dataOrganizationPlacesStatistics)
        .returns(dataOrganizationPlacesStatisticsSerialized);

      const dependencies = {
        dataOrganizationPlacesStatisticsSerializer: dataOrganizationPlacesStatisticsSerializerStub,
        getOrganizationPlacesStatistics: getOrganizationPlacesStatisticsStub,
        findPaginatedFilteredOrganizations: findPaginatedFilteredOrganizationsStub,
      };

      // when
      const result = await organizationPlaceController.getDataOrganizationsPlacesStatistics(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(result).to.equal(dataOrganizationPlacesStatisticsSerialized);
    });
  });
});
