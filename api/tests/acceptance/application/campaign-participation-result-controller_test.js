const createServer = require('../../../server');
const { expect, databaseBuilder, mockLearningContent, learningContentBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
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
    targetProfileSkills;

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

    const skillIds = [
      'recSkill1',
      'recSkill2',
      'recSkill3',
      'recSkill4',
      'recSkill5',
      'recSkill6',
      'recSkill7',
      'recSkill8',
    ];

    targetProfileSkills = _.times(8, (index) => {
      return databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfile.id,
        skillId: skillIds[index],
      });
    });

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

    const learningContent = [{
      id: 'recArea1',
      color: JAFFA_COLOR,
      competences: [{
        id: 1,
        name: 'Agir collectivement',
        index: '1.2',
        tubes: [{ id: 'recTube1', skills: [{ id: 'recSkill1' }] }],
      }],
    }, {
      id: 'recArea2',
      color: EMERALD_COLOR,
      competences: [{
        id: 2,
        name: 'Nécessité de la pensée radicale',
        index: '2.1',
        tubes: [{
          id: 'recTube2',
          skills: [
            { id: 'recSkill2' },
            { id: 'recSkill3' },
            { id: 'recSkill4' },
          ],
        }],
      }, {
        id: 3,
        name: 'Changer efficacement le monde',
        index: '2.2',
        tubes: [{
          id: 'recTube3',
          skills: [
            { id: 'recSkill5' },
            { id: 'recSkill6' },
            { id: 'recSkill7' },
            { id: 'recSkill8' },
          ],
        }],
      }],
    }, {
      id: 'recArea3',
      color: WILD_STRAWBERRY_COLOR,
      competences: [{
        id: 4,
        name: 'Oser la paresse',
        index: '4.3',
        tubes: [{ id: 'recTube0', skills: [{ id: 'notIncludedSkillId' }] }],
      }],
    }];
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);
    await databaseBuilder.commit();
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
                id: '1',
                type: 'competenceResults',
              }, {
                id: '2',
                type: 'competenceResults',
              }, {
                id: '3',
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
          id: '1',
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
          id: '2',
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
          id: '3',
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
