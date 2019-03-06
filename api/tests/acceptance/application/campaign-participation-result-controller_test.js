const createServer = require('../../../server');
const { expect, databaseBuilder, airtableBuilder, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const _ = require('lodash');

describe('Acceptance | API | Campaign Participation Result', () => {

  let user,
    campaign,
    assessment,
    campaignParticipation,
    targetProfile,
    targetProfileSkills,
    skills;

  let server;

  beforeEach(async () => {
    server = await createServer();

    const oldDate = new Date('2018-02-03');
    const recentDate = new Date('2018-05-06');
    const futureDate = new Date('2018-07-10');

    user = databaseBuilder.factory.buildUser();
    targetProfile = databaseBuilder.factory.buildTargetProfile();
    campaign = databaseBuilder.factory.buildCampaign({
      targetProfileId: targetProfile.id,
    });
    assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id,
      type: 'SMART_PLACEMENT',
      state: 'completed',
    });
    campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      assessmentId: assessment.id,
      userId: user.id,
      sharedAt: recentDate,
      isShared: true,
    });

    targetProfileSkills = _.times(8, () => {
      return databaseBuilder.factory.buildTargetProfilesSkills({
        targetProfileId: targetProfile.id,
      });
    });
    skills = _.map(targetProfileSkills, (targetProfileSkill) => {
      return airtableBuilder.factory.buildSkill({
        id: targetProfileSkill.skillId
      });
    });

    targetProfileSkills.slice(2).forEach((targetProfileSkill, index) => {
      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
        userId: user.id,
        assessmentId: assessment.id,
        skillId: targetProfileSkill.skillId,
        status: index < 3 ? 'validated' : 'invalidated',
        createdAt: index < 5 ? oldDate : futureDate,
      });
    });

    databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
      userId: user.id,
      assessmentId: assessment.id,
      skillId: 'otherSkillId',
      createdAt: oldDate,
    });

    airtableBuilder
      .mockList({ tableName: 'Acquis' })
      .returns(skills)
      .activate();

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
    await airtableBuilder.cleanAll();
  });

  describe('GET /api/campaign-participations/{id}/campaign-participation-result', () => {
    let options;

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
      };
    });

    it('should return the campaignParticipationResult of the campaignParticipation', async () => {
      // given
      const expectedResponse = {
        data: {
          type: 'campaign-participation-results',
          id: campaignParticipation.id.toString(),
          attributes: {
            'total-skills': 8,
            'tested-skills': 5,
            'validated-skills': 3,
            'is-completed': true
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedResponse);
    });
  });
});
