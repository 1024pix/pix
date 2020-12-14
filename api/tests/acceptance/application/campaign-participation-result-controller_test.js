const createServer = require('../../../server');
const { expect, databaseBuilder, airtableBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const _ = require('lodash');

describe('Acceptance | API | Campaign Participation Result', () => {

  const JAFFA_COLOR = 'jaffa';
  const EMERALD_COLOR = 'emerald';
  const WILD_STRAWBERRY_COLOR = 'wild-strawberry';

  let user,
    campaign,
    assessment,
    campaignParticipation,
    targetProfile,
    targetProfileSkills,
    skills,
    areas,
    competences;

  let server, badge, badgePartnerCompetence, stage;

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
      type: 'CAMPAIGN',
      state: 'completed',
    });

    targetProfileSkills = _.times(8, () => {
      return databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfile.id,
      });
    });

    skills = _.map(targetProfileSkills, (targetProfileSkill) => {
      return airtableBuilder.factory.buildSkill({
        id: targetProfileSkill.skillId,
      });
    });
    const skillIds = _.map(skills, (skill) => skill.id);

    badge = databaseBuilder.factory.buildBadge({
      id: 1,
      altMessage: 'Banana',
      imageUrl: '/img/banana.svg',
      message: 'You won a Banana Badge',
      title: 'Banana',
      key: 'PIX_BANANA',
      targetProfileId: targetProfile.id,
    });

    badgePartnerCompetence = databaseBuilder.factory.buildBadgePartnerCompetence({
      id: 1,
      badgeId: 1,
      name: 'Pix Emploi',
      color: 'emerald',
      skillIds,
    });

    stage = databaseBuilder.factory.buildStage({
      id: 1,
      message: 'Tu as le palier 1',
      title: 'palier 1',
      threshold: 20,
      targetProfileId: targetProfile.id,
    });

    databaseBuilder.factory.buildStage({
      id: 2,
      message: 'Tu as le palier 2',
      title: 'palier 2',
      threshold: 50,
      targetProfileId: targetProfile.id,
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

    const jaffaArea = airtableBuilder.factory.buildArea({ id: 1, competenceIds: ['1'], couleur: JAFFA_COLOR });
    const emeraldArea = airtableBuilder.factory.buildArea({ id: 2, competenceIds: ['2', '3'], couleur: EMERALD_COLOR });
    const wildStrawberryArea = airtableBuilder.factory.buildArea({ id: 3, competenceIds: ['4'], couleur: WILD_STRAWBERRY_COLOR });
    areas = [jaffaArea, emeraldArea, wildStrawberryArea];

    competences = [
      airtableBuilder.factory.buildCompetence({
        id: 1,
        titre: 'Agir collectivement',
        sousDomaine: '1.2',
        acquisViaTubes: [skills[0].id],
        domaineIds: [areas[0].id],
      }),
      airtableBuilder.factory.buildCompetence({
        id: 2,
        titre: 'Nécessité de la pensée radicale',
        sousDomaine: '2.1',
        acquisViaTubes: [skills[1].id, skills[2].id, skills[3].id],
        domaineIds: [areas[1].id],
      }),
      airtableBuilder.factory.buildCompetence({
        id: 3,
        titre: 'Changer efficacement le monde',
        sousDomaine: '2.2',
        acquisViaTubes: [skills[4].id, skills[5].id, skills[6].id, skills[7].id],
        domaineIds: [areas[1].id],
      }),
      airtableBuilder.factory.buildCompetence({
        id: 4,
        titre: 'Oser la paresse',
        sousDomaine: '4.3',
        acquisViaTubes: ['notIncludedSkillId'],
        domaineIds: [areas[2].id],
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
      .returns(areas)
      .activate();

    await databaseBuilder.commit();
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
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
            'mastery-percentage': 38,
            'progress': 1,
            'total-skills-count': 8,
            'tested-skills-count': 5,
            'validated-skills-count': 3,
            'is-completed': true,
            'stage-count': 2,
          },
          relationships: {
            'campaign-participation-badges': {
              data: [{
                id: `${badge.id}`,
                type: 'campaignParticipationBadges',
              }],
            },
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
              }],
            },
            'reached-stage': {
              data: {
                id: `${stage.id}`,
                type: 'reached-stages',
              },
            },
          },
        },
        included: [{
          attributes: {
            'area-color': 'emerald',
            index: undefined,
            'mastery-percentage': 38,
            name: 'Pix Emploi',
            'tested-skills-count': 5,
            'total-skills-count': 8,
            'validated-skills-count': 3,
          },
          id: badgePartnerCompetence.id.toString(),
          type: 'partnerCompetenceResults',
        }, {
          attributes: {
            'alt-message': 'Banana',
            'image-url': '/img/banana.svg',
            'is-acquired': false,
            key: 'PIX_BANANA',
            title: 'Banana',
            message: 'You won a Banana Badge',
          },
          id: '1',
          type: 'campaignParticipationBadges',
          relationships: {
            'partner-competence-results': {
              data: [
                {
                  id: '1',
                  type: 'partnerCompetenceResults',
                },
              ],
            },
          },
        }, {
          type: 'competenceResults',
          id: competences[0].id.toString(),
          attributes: {
            name: 'Agir collectivement',
            index: '1.2',
            'mastery-percentage': 0,
            'total-skills-count': 1,
            'tested-skills-count': 0,
            'validated-skills-count': 0,
            'area-color': JAFFA_COLOR,
          },
        }, {
          type: 'competenceResults',
          id: competences[1].id.toString(),
          attributes: {
            name: 'Nécessité de la pensée radicale',
            index: '2.1',
            'mastery-percentage': 67,
            'total-skills-count': 3,
            'tested-skills-count': 2,
            'validated-skills-count': 2,
            'area-color': EMERALD_COLOR,
          },
        }, {
          type: 'competenceResults',
          id: competences[2].id.toString(),
          attributes: {
            name: 'Changer efficacement le monde',
            index: '2.2',
            'mastery-percentage': 25,
            'total-skills-count': 4,
            'tested-skills-count': 3,
            'validated-skills-count': 1,
            'area-color': EMERALD_COLOR,
          },
        }, {
          attributes: {
            'message': 'Tu as le palier 1',
            'title': 'palier 1',
            'threshold': 20,
            'star-count': 1,
          },
          id: stage.id.toString(),
          type: 'reached-stages',
        }],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.result).to.deep.equal(expectedResponse);
      expect(response.statusCode).to.equal(200);
    });
  });
});
