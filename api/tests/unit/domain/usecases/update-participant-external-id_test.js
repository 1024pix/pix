import { expect, sinon } from '../../../test-helper.js';
import { usecases } from '../../../../lib/shared/domain/usecases/index.js';

const { updateParticipantExternalId } = usecases;

describe('Unit | UseCase | update-participation-external-id', function () {
  it('should call repository method to update the external id for a participation', async function () {
    //given
    const participationsForCampaignManagementRepository = {
      updateParticipantExternalId: sinon.stub(),
    };

    //when
    await updateParticipantExternalId({
      campaignParticipationId: 34,
      participantExternalId: 'new1234567',
      participationsForCampaignManagementRepository,
    });

    //then
    expect(
      participationsForCampaignManagementRepository.updateParticipantExternalId
    ).to.have.been.calledOnceWithExactly({
      campaignParticipationId: 34,
      participantExternalId: 'new1234567',
    });
  });
});
