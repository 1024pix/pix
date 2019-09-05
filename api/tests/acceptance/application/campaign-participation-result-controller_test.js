const createServer = require('../../../server');
const { expect, databaseBuilder, airtableBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/cache');
const _ = require('lodash');

describe('Acceptance | API | Campaign Participation Result', () => {

  let user,
    campaign,
    assessment,
    campaignParticipation,
    targetProfile,
    targetProfileSkills,
    skills,
    competences;

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
    campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      userId: user.id,
      sharedAt: recentDate,
      isShared: true,
    });
    assessment = databaseBuilder.factory.buildAssessment({
      campaignParticipationId: campaignParticipation.id,
      userId: user.id,
      type: 'SMART_PLACEMENT',
      state: 'completed',
    });

    targetProfileSkills = _.times(8, () => {
      return databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfile.id,
      });
    });
    skills = _.map(targetProfileSkills, (targetProfileSkill) => {
      return airtableBuilder.factory.buildSkill({
        id: targetProfileSkill.skillId
      });
    });

    targetProfileSkills.slice(2).forEach((targetProfileSkill, index) => {
      databaseBuilder.factory.buildKnowledgeElement({
        userId: user.id,
        assessmentId: assessment.id,
        skillId: targetProfileSkill.skillId,
        status: index < 3 ? 'validated' : 'invalidated',
        createdAt: index < 5 ? oldDate : futureDate,
      });
    });

    databaseBuilder.factory.buildKnowledgeElement({
      userId: user.id,
      assessmentId: assessment.id,
      skillId: 'otherSkillId',
      createdAt: oldDate,
    });

    competences = [
      airtableBuilder.factory.buildCompetence({
        id: 1,
        titre: 'Agir collectivement',
        sousDomaine: '1.2',
        acquisViaTubes: [skills[0].id],
      }),
      airtableBuilder.factory.buildCompetence({
        id: 2,
        titre: 'Nécessité de la pensée radicale',
        sousDomaine: '2.1',
        acquisViaTubes: [skills[1].id, skills[2].id, skills[3].id],
      }),
      airtableBuilder.factory.buildCompetence({
        id: 3,
        titre: 'Changer efficacement le monde',
        sousDomaine: '2.2',
        acquisViaTubes: [skills[4].id, skills[5].id, skills[6].id, skills[7].id],
      }),
      airtableBuilder.factory.buildCompetence({
        id: 4,
        titre: 'Oser la paresse',
        sousDomaine: '4.3',
        acquisViaTubes: ['notIncludedSkillId'],
      }),
    ];

    airtableBuilder
      .mockList({ tableName: 'Acquis' })
      .returns(skills)
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Competences' })
      .returns(competences)
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Domaines' })
      .returns([])
      .activate();

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await cache.flushAll();
    await databaseBuilder.clean();
    await airtableBuilder.cleanAll();
  });

  describe('GET /api/campaign-participations/{id}/campaign-participation-result', () => {
    let options;

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    it('should return the campaignParticipationResult of the campaignParticipation', async () => {
      // given
      const expectedResponse = {
        data: {
          type: 'campaign-participation-results',
          id: campaignParticipation.id.toString(),
          attributes: {
            'total-skills-count': 8,
            'tested-skills-count': 5,
            'validated-skills-count': 3,
            'is-completed': true
          },
          relationships: {
            'competence-results': {
              data: [{
                id: `${competences[0].id}`,
                type: 'competenceResults',
              }, {
                id: `${competences[1].id}`,
                type: 'competenceResults',
              }, {
                id: `${competences[2].id}`,
                type: 'competenceResults',
              }]
            },
          },
        },
        included: [{
          type: 'competenceResults',
          id: competences[0].id.toString(),
          attributes: {
            name: 'Agir collectivement',
            index: '1.2',
            'total-skills-count': 1,
            'tested-skills-count': 0,
            'validated-skills-count': 0,
          },
        }, {
          type: 'competenceResults',
          id: competences[1].id.toString(),
          attributes: {
            name: 'Nécessité de la pensée radicale',
            index: '2.1',
            'total-skills-count': 3,
            'tested-skills-count': 2,
            'validated-skills-count': 2,
          },
        }, {
          type: 'competenceResults',
          id: competences[2].id.toString(),
          attributes: {
            name: 'Changer efficacement le monde',
            index: '2.2',
            'total-skills-count': 4,
            'tested-skills-count': 3,
            'validated-skills-count': 1,
          },
        }],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedResponse);
    });
  });
});
