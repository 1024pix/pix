import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | GET /api/admin/users/{id}/participations', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  it('should return participations', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    const campaign = databaseBuilder.factory.buildCampaign();
    const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
    const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      userId: user.id,
      campaignId: campaign.id,
      organizationLearnerId: organizationLearner.id,
    });
    const admin = databaseBuilder.factory.buildUser.withRole();
    await databaseBuilder.commit();

    // when
    const response = await server.inject({
      method: 'GET',
      url: `/api/admin/users/${user.id}/participations`,
      headers: { authorization: generateValidRequestAuthorizationHeader(admin.id) },
    });

    // then
    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal({
      data: [
        {
          id: campaignParticipation.id.toString(),
          type: 'user-participations',
          attributes: {
            'campaign-code': campaign.code,
            'campaign-id': campaign.id,
            'created-at': campaignParticipation.createdAt,
            'deleted-at': null,
            'deleted-by': null,
            'participant-external-id': campaignParticipation.participantExternalId,
            'shared-at': campaignParticipation.sharedAt,
            status: campaignParticipation.status,
            'organization-learner-full-name': `${organizationLearner.firstName} ${organizationLearner.lastName}`,
          },
        },
      ],
    });
  });
});
