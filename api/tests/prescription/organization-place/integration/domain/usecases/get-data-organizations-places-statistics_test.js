import { getDataOrganizationsPlacesStatistics } from '../../../../../../src/prescription/organization-place/domain/usecases/get-data-organizations-places-statistics.js';
import { usecases as organizationPlacesUsecases } from '../../../../../../src/prescription/organization-place/domain/usecases/index.js';
import * as organizationRepository from '../../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { databaseBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Integration | UseCases | get-data-organizations-places-statistics', function () {
  let clock;
  const now = new Date('2021-05-01');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  it('should return places statistics for all organizations', async function () {
    // given
    const firstOrganization = databaseBuilder.factory.buildOrganization({
      id: 1,
      name: 'Mon collège',
      type: 'SCO',
    });
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
      organizationId: firstOrganization.id,
    }).id;
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId: firstOrganization.id }).id;
    databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId });
    databaseBuilder.factory.buildOrganizationPlace({
      count: 10,
      organizationId: firstOrganization.id,
      activationDate: new Date('2021-04-01'),
      expirationDate: new Date('2021-05-15'),
    });
    const secondOrganization = databaseBuilder.factory.buildOrganization({ id: 2, name: 'Pole Emploi', type: 'PRO' });
    databaseBuilder.factory.buildOrganizationPlace({
      count: 5,
      organizationId: secondOrganization.id,
      activationDate: new Date('2021-04-01'),
      expirationDate: new Date('2021-05-15'),
    });
    await databaseBuilder.commit();

    // when
    const dataOrganizationsPlacesStatistics = await getDataOrganizationsPlacesStatistics({
      getOrganizationPlacesStatistics: organizationPlacesUsecases.getOrganizationPlacesStatistics,
      organizationRepository,
    });

    // then
    expect(dataOrganizationsPlacesStatistics[0].organizationId).to.equal(firstOrganization.id);
    expect(dataOrganizationsPlacesStatistics[0].organizationActivePlacesLotCount).to.equal(1);
    expect(dataOrganizationsPlacesStatistics[0].organizationPlacesCount).to.equal(10);
    expect(dataOrganizationsPlacesStatistics[0].organizationOccupiedPlacesCount).to.equal(1);
    expect(dataOrganizationsPlacesStatistics[0].organizationName).to.equal('Mon collège');
    expect(dataOrganizationsPlacesStatistics[0].organizationType).to.equal('SCO');

    expect(dataOrganizationsPlacesStatistics[1].organizationId).to.equal(secondOrganization.id);
    expect(dataOrganizationsPlacesStatistics[1].organizationActivePlacesLotCount).to.equal(1);
    expect(dataOrganizationsPlacesStatistics[1].organizationPlacesCount).to.equal(5);
    expect(dataOrganizationsPlacesStatistics[1].organizationName).to.equal('Pole Emploi');
    expect(dataOrganizationsPlacesStatistics[1].organizationType).to.equal('PRO');
    expect(dataOrganizationsPlacesStatistics[1].organizationOccupiedPlacesCount).to.equal(0);
  });
});
