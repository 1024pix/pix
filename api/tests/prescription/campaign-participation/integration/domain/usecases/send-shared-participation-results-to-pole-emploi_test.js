import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import * as poleEmploiNotifier from '../../../../../../src/prescription/campaign-participation/infrastructure/externals/pole-emploi-notifier.js';
import {
  databaseBuilder,
  expect,
  knex,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../../test-helper.js';

describe('Integration | Domain | UseCases | send-shared-participation-results-to-pole-emploi', function () {
  let campaignParticipationId, userId, responseCode;
  let httpAgentStub, httpErrorsHelperStub, monitoringToolsStub;

  beforeEach(async function () {
    httpAgentStub = { post: sinon.stub() };
    monitoringToolsStub = { logErrorWithCorrelationIds: sinon.stub(), logInfoWithCorrelationIds: sinon.stub() };
    httpErrorsHelperStub = { serializeHttpErrorResponse: sinon.stub() };
    responseCode = Symbol('responseCode');

    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId });

    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const tagId = databaseBuilder.factory.buildTag({ name: 'POLE EMPLOI' }).id;
    databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    databaseBuilder.factory.buildCampaignSkill({ campaignId });
    campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId }).id;
    databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
    const learningContentObjects = learningContentBuilder.fromAreas([]);
    mockLearningContent(learningContentObjects);
    return databaseBuilder.commit();
  });

  it('should save success of this notification', async function () {
    // given
    httpAgentStub.post.resolves({
      isSuccessful: true,
      code: responseCode,
      data: {
        access_token: 'token',
        expires_in: new Date(),
        refresh_token: 'refresh_token',
      },
    });

    // when
    await usecases.sendSharedParticipationResultsToPoleEmploi({
      campaignParticipationId,
      poleEmploiNotifier,
      notifierDependencies: {
        httpAgent: httpAgentStub,
        httpErrorsHelper: httpErrorsHelperStub,
        monitoringTools: monitoringToolsStub,
      },
    });

    // then
    const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
    expect(poleEmploiSendings.length).to.equal(1);
    expect(poleEmploiSendings[0].responseCode).to.equal(responseCode.toString());
    expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_SHARING');
  });

  it('should return a disable send notification by default (if push is disabled) ', async function () {
    // when
    await usecases.sendSharedParticipationResultsToPoleEmploi({
      campaignParticipationId,
    });

    // then
    const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
    expect(poleEmploiSendings.length).to.equal(1);
    expect(poleEmploiSendings[0].isSuccessful).to.be.false;
    expect(poleEmploiSendings[0].responseCode).to.equal('SENDING-DISABLED');
    expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_SHARING');
  });
});
