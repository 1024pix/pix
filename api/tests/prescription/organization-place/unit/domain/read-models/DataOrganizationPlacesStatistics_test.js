import { Organization } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import { DataOrganizationPlacesStatistics } from '../../../../../../src/prescription/organization-place/domain/read-models/DataOrganizationPlacesStatistics.js';
import { PlacesLot } from '../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';
import { PlaceStatistics } from '../../../../../../src/prescription/organization-place/domain/read-models/PlaceStatistics.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | ReadModels | DataOrganizationPlacesStatistics', function () {
  let clock;
  const now = new Date('2021-05-01');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  it('create DataOrganizationPlacesStatistics', function () {
    const organization = new Organization({
      id: 1,
      name: 'OrganizationName',
      type: 'SCO',
    });
    const placeStatistics = new PlaceStatistics({
      placesLots: [
        new PlacesLot({
          count: 10,
          expirationDate: new Date('2022-05-02'),
          activationDate: new Date('2019-04-01'),
          deletedAt: null,
        }),
      ],
      placeRepartition: { totalUnRegisteredParticipant: 0, totalRegisteredParticipant: 2 },
      organizationId: organization.id,
    });

    const dataOrganizationPlacesStatistics = new DataOrganizationPlacesStatistics({ placeStatistics, organization });

    expect(dataOrganizationPlacesStatistics.organizationId).to.equal(organization.id);
    expect(dataOrganizationPlacesStatistics.organizationName).to.equal(organization.name);
    expect(dataOrganizationPlacesStatistics.organizationType).to.equal(organization.type);
    expect(dataOrganizationPlacesStatistics.organizationPlacesCount).to.equal(10);
    expect(dataOrganizationPlacesStatistics.organizationOccupiedPlacesCount).to.equal(2);
    expect(dataOrganizationPlacesStatistics.organizationActivePlacesLotCount).to.equal(1);
  });
});
