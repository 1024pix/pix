import sinon from 'sinon';

import { UserCampaignSurvey } from '../../../../../src/devcomp/domain/models/UserCampaignSurvey.js';
import { saveUserCampaignSurvey } from '../../../../../src/devcomp/domain/usecases/save-user-campaign-survey.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | save-user-campaign-survey', function () {
  it('should save a UserCampaignSurvey and return its id', async function () {
    // given
    const userId = 1;
    const campaignId = 2;
    const satisfactionScore = 4;
    const createdId = 99;

    const userCampaignSurveyRepository = {
      save: sinon.stub().resolves(createdId),
    };

    // when
    const result = await saveUserCampaignSurvey({
      userId,
      campaignId,
      satisfactionScore,
      userCampaignSurveyRepository,
    });

    // then
    expect(userCampaignSurveyRepository.save).to.have.been.calledOnce;
    const savedArg = userCampaignSurveyRepository.save.firstCall.args[0];
    expect(savedArg).to.be.instanceOf(UserCampaignSurvey);
    expect(savedArg.userId).to.equal(userId);
    expect(savedArg.campaignId).to.equal(campaignId);
    expect(savedArg.satisfactionScore).to.equal(satisfactionScore);
    expect(result).to.equal(createdId);
  });
});
