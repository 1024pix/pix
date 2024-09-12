import { OrganizationPlacesLotForManagement } from '../../../../../../src/prescription/organization-place/domain/models/OrganizationPlacesLotForManagement.js';
import { OrganizationPlacesLotManagement } from '../../../../../../src/prescription/organization-place/domain/read-models/OrganizationPlacesLotManagement.js';
import { createOrganizationPlacesLot } from '../../../../../../src/prescription/organization-place/domain/usecases/create-organization-places-lot.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | create-organization-places-lot', function () {
  let organizationPlacesLotRepository, organizationRepository, organization;

  beforeEach(function () {
    organizationPlacesLotRepository = {
      create: sinon.stub(),
      get: sinon.stub(),
    };
  });

  it('should create organization place lot with given data', async function () {
    organization = domainBuilder.buildOrganization();
    organizationRepository = {
      get: sinon.stub().resolves(organization),
    };

    //given
    const organizationId = organization.id;
    const createdBy = 666;
    const organizationPlacesLotData = {
      organizationId,
      createdBy,
      count: 10,
      category: OrganizationPlacesLotForManagement.categories.FREE_RATE,
      activationDate: '2022-01-02',
      expirationDate: '2023-01-01',
      reference: 'ABC123',
    };

    const organizationPlacesLotId = 12;

    const expectedOrganizationPlacesLotData = new OrganizationPlacesLotForManagement({
      ...organizationPlacesLotData,
      organizationId,
      createdBy,
    });

    const expectedOrganizatonPlacesLotManagement = new OrganizationPlacesLotManagement(
      expectedOrganizationPlacesLotData,
    );

    organizationPlacesLotRepository.create
      .withArgs(expectedOrganizationPlacesLotData)
      .resolves(organizationPlacesLotId);
    organizationRepository.get.withArgs(organizationId).resolves(organization);
    organizationPlacesLotRepository.get
      .withArgs(organizationPlacesLotId)
      .resolves(expectedOrganizatonPlacesLotManagement);

    //when
    const result = await createOrganizationPlacesLot({
      organizationPlacesLotData,
      organizationId,
      createdBy,
      organizationPlacesLotRepository,
      organizationRepository,
    });

    //then
    expect(result).to.equal(expectedOrganizatonPlacesLotManagement);
  });
});
