import { expect, sinon, domainBuilder } from '../../../test-helper';
import OrganizationPlacesLot from '../../../../lib/domain/models/OrganizationPlacesLot';
import createOrganizationPlacesLot from '../../../../lib/domain/usecases/create-organization-places-lot';
import organizationPlacesLotManagement from '../../../../lib/domain/read-models/OrganizationPlacesLotManagement';

describe('Unit | UseCase | create-organization-place-lot', function () {
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
      category: OrganizationPlacesLot.categories.FREE_RATE,
      activationDate: '2022-01-02',
      expirationDate: '2023-01-01',
      reference: 'ABC123',
    };

    const organizationPlaceLotId = 12;

    const expectedOrganizationPlacesLotData = new OrganizationPlacesLot({
      ...organizationPlacesLotData,
      organizationId,
      createdBy,
    });

    const expectedOrganizatonPlacesLotManagement = new organizationPlacesLotManagement(
      expectedOrganizationPlacesLotData
    );

    organizationPlacesLotRepository.create.withArgs(expectedOrganizationPlacesLotData).resolves(organizationPlaceLotId);
    organizationRepository.get.withArgs(organizationId).resolves(organization);
    organizationPlacesLotRepository.get
      .withArgs(organizationPlaceLotId)
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
