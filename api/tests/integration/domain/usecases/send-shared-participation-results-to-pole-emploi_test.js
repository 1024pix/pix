import {
  expect,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  sinon,
} from '../../../test-helper.js';

import { usecases } from '../../../../lib/domain/usecases/index.js';

describe('Integration | Domain | UseCases | send-shared-participation-results-to-pole-emploi', function () {
  let campaignParticipationId, userId, responseCode;
  let poleEmploiNotifier;

  beforeEach(async function () {
    responseCode = Symbol('responseCode');
    poleEmploiNotifier = {
      notify: sinon.stub(),
    };

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
    poleEmploiNotifier.notify.resolves({ isSuccessful: true, code: responseCode });

    // when
    await usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId, poleEmploiNotifier });

    // then
    const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
    expect(poleEmploiSendings.length).to.equal(1);
    expect(poleEmploiSendings[0].responseCode).to.equal(responseCode.toString());
    expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_SHARING');
  });
});
