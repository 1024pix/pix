import { expect, sinon, catchErr } from '../../../test-helper';
import getParticipationsCountByMasteryRate from '../../../../lib/domain/usecases/get-participations-count-by-mastery-rate';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | getParticipationsCountByMasteryRate', function () {
  context('when the user has access to the campaign', function () {
    it('return the distribution of results', async function () {
      const campaignId = 12;
      const userId = 12;
      const expectedResultDistribution = Symbol('ResultDitribution');
      const campaignParticipationsStatsRepository = { countParticipationsByMasteryRate: sinon.stub() };
      const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      campaignParticipationsStatsRepository.countParticipationsByMasteryRate
        .withArgs({ campaignId })
        .resolves(expectedResultDistribution);

      const participationsCountByMasteryRate = await getParticipationsCountByMasteryRate({
        campaignId,
        userId,
        campaignParticipationsStatsRepository,
        campaignRepository,
      });

      expect(participationsCountByMasteryRate).to.equal(expectedResultDistribution);
    });
  });
  context('when the user does not have access to the campaign', function () {
    it('throws an error', async function () {
      const campaignId = 12;
      const userId = 12;
      const campaignParticipationsStatsRepository = { countParticipationsByMasteryRate: sinon.stub() };
      const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);
      campaignParticipationsStatsRepository.countParticipationsByMasteryRate.rejects();

      const error = await catchErr(getParticipationsCountByMasteryRate)({
        campaignId,
        userId,
        campaignParticipationsStatsRepository,
        campaignRepository,
      });

      expect(error).to.be.an.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
