import { expect, sinon } from '../../../../../test-helper.js';
import { getOrganizationPlacesStatistics } from '../../../../../../src/prescription/organization-place/domain/usecases/get-organization-places-statistics.js';
import { PlaceStatistics } from '../../../../../../src/prescription/organization-place/domain/read-models/PlaceStatistics.js';

describe('Unit | Domain | Use Cases | get-organization-places-statistics', function () {
  it('should get the organization places statistics', async function () {
    // given
    const organizationId = Symbol('organizationId');
    const placeStatistics = Symbol('PlaceStatistics');
    const placesLots = Symbol('PlacesLots');
    const countOfActiveLearners = 3;

    const placeStatisticsBuildFromStub = sinon.stub(PlaceStatistics, 'buildFrom').returns(placeStatistics);

    const organizationPlacesLotRepository = {
      findAllByOrganizationId: sinon.stub(),
    };
    const organizationLearnerRepository = {
      countActiveWithAtLeastOneParticipationByOrganizationId: sinon.stub(),
    };
    organizationPlacesLotRepository.findAllByOrganizationId.withArgs(organizationId).resolves(placesLots);

    organizationLearnerRepository.countActiveWithAtLeastOneParticipationByOrganizationId
      .withArgs(organizationId)
      .resolves(countOfActiveLearners);

    // when
    const organizationPlacesStatistics = await getOrganizationPlacesStatistics({
      organizationId,
      organizationPlacesLotRepository,
      organizationLearnerRepository,
    });

    // then
    expect(organizationPlacesStatistics).to.equal(placeStatistics);
    expect(placeStatisticsBuildFromStub).to.have.been.calledWithExactly({
      organizationId,
      placesLots: placesLots,
      numberOfParticipantWithAtLeastOneParticipation: countOfActiveLearners,
    });
  });
});
