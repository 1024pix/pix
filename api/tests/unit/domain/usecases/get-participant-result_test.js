const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const getParticipantResult = require('../../../../lib/domain/usecases/get-participant-result');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-participant-result', () => {

  let campaignParticipationRepository;
  let participantResultRepository;
  let dependencies;

  beforeEach(() => {
    campaignParticipationRepository = { get: sinon.stub() };
    participantResultRepository = { getByParticipationId: sinon.stub() };
    dependencies = { campaignParticipationRepository, participantResultRepository };
  });

  context('when user is the owner of the participation', () => {

    it('should get the participant result', async () => {
      const userId = 123;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: 12, userId });
      const { id: campaignParticipationId } = campaignParticipation;
      const locale = 'FR';
      const participantResult = Symbol();

      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId }).resolves(campaignParticipation);
      participantResultRepository.getByParticipationId.withArgs(campaignParticipationId, locale).resolves(participantResult);

      const actualCampaignParticipationResult = await getParticipantResult({
        userId,
        locale,
        campaignParticipationId,
        ...dependencies,
      });

      expect(actualCampaignParticipationResult).to.deep.equal(participantResult);
    });
  });

  context('when user is not the owner of the campaignParticipation', () => {

    it('should throw an error', async () => {
      const userId = 123;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: 12, userId: 456 });
      const { id: campaignParticipationId } = campaignParticipation;
      const locale = 'FR';
      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId }).resolves(campaignParticipation);

      const result = await catchErr(getParticipantResult)({
        userId,
        campaignParticipationId,
        locale,
        ...dependencies,
      });

      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
