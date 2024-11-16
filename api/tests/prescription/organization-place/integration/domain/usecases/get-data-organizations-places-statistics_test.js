import * as organizationLearnerRepository from '../../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { getDataOrganizationsPlacesStatistics } from '../../../../../../src/prescription/organization-place/domain/usecases/get-data-organizations-places-statistics.js';
import * as organizationPlacesLotRepository from '../../../../../../src/prescription/organization-place/infrastructure/repositories/organization-places-lot-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
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
    const placesManagementFeatureId = databaseBuilder.factory.buildFeature({
      key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
    }).id;
    databaseBuilder.factory.buildOrganizationFeature({
      organizationId: firstOrganization.id,
      featureId: placesManagementFeatureId,
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
      count: null,
      organizationId: secondOrganization.id,
      activationDate: new Date('2021-04-01'),
      expirationDate: new Date('2021-05-15'),
    });

    databaseBuilder.factory.buildOrganizationFeature({
      organizationId: secondOrganization.id,
      featureId: placesManagementFeatureId,
    });

    await databaseBuilder.commit();

    // when
    const dataOrganizationsPlacesStatistics = await getDataOrganizationsPlacesStatistics({
      organizationRepository,
      organizationPlacesLotRepository,
      organizationLearnerRepository,
    });

    // then
    const results = dataOrganizationsPlacesStatistics.map((dataOrganizationsPlacesStatistic) => ({
      organizationId: dataOrganizationsPlacesStatistic.organizationId,
      organizationActivePlacesLotCount: dataOrganizationsPlacesStatistic.organizationActivePlacesLotCount,
      organizationPlacesCount: dataOrganizationsPlacesStatistic.organizationPlacesCount,
      organizationOccupiedPlacesCount: dataOrganizationsPlacesStatistic.organizationOccupiedPlacesCount,
      organizationName: dataOrganizationsPlacesStatistic.organizationName,
      organizationType: dataOrganizationsPlacesStatistic.organizationType,
    }));

    expect(dataOrganizationsPlacesStatistics).lengthOf(2);
    expect(results).to.have.deep.members([
      {
        organizationId: secondOrganization.id,
        organizationActivePlacesLotCount: 1,
        organizationPlacesCount: null,
        organizationOccupiedPlacesCount: 0,
        organizationName: 'Pole Emploi',
        organizationType: 'PRO',
      },
      {
        organizationId: firstOrganization.id,
        organizationActivePlacesLotCount: 1,
        organizationPlacesCount: 10,
        organizationOccupiedPlacesCount: 1,
        organizationName: 'Mon collège',
        organizationType: 'SCO',
      },
    ]);
  });
});
