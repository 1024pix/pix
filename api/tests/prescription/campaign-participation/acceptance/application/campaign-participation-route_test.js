import times from 'lodash/times.js';

import { constants } from '../../../../../src/shared/domain/constants.js';
import { SCOPES } from '../../../../../src/shared/domain/models/BadgeDetails.js';
import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../test-helper.js';

describe('Acceptance | API | Campaign Participations', function () {
  let server, options, userId, organizationId, campaignId;

  beforeEach(async function () {
    server = await createServer();
    userId = databaseBuilder.factory.buildUser().id;
    organizationId = databaseBuilder.factory.buildOrganization().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
  });

  describe('DELETE /api/campaign/{campaignId}/campaign-participations/{campaignParticipationId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationRole: 'ADMIN', organizationId });

      await databaseBuilder.commit();
      options = {
        method: 'DELETE',
        url: `/api/campaigns/${campaignId}/campaign-participations/${campaignParticipationId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/campaigns/{campaignId}/profiles-collection-participations/{campaignParticipationId}', function () {
    beforeEach(async function () {
      const learningObjects = learningContentBuilder.fromAreas([]);
      await mockLearningContent(learningObjects);
    });

    it('should return the campaign profile as JSONAPI', async function () {
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Die Hard',
        campaignId,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/profiles-collection-participations/${campaignParticipation.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const campaignProfile = response.result.data.attributes;
      expect(campaignProfile['external-id']).to.equal('Die Hard');
    });
  });

  describe('DELETE /api/admin/campaign-participations/{id}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/campaign-participations/${campaignParticipationId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/campaign-participations/{id}/analyses', function () {
    let campaignParticipation;

    beforeEach(async function () {
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId2' });
      const sharedAt = new Date('2020-01-01');
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        snapshot: JSON.stringify([]),
        campaignParticipationId: campaignParticipation.id,
      });

      await databaseBuilder.commit();

      const learningContent = [
        {
          id: 'recArea1',
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: { fr: 'Fabriquer un meuble' },
              tubes: [
                {
                  id: 'recTube1',
                  practicalTitle_i18n: { fr: 'Monter une étagère' },
                  practicalDescription_i18n: { fr: 'Comment monter une étagère' },
                  skills: [
                    {
                      id: 'recSkillId1',
                      nom: '@skill1',
                      level: 1,
                      challenges: [],
                      tutorials: [
                        {
                          id: 'recTutorial1',
                          title: 'Apprendre à vivre confiné',
                          format: '2 mois',
                          source: 'covid-19',
                          link: 'www.liberez-moi.fr',
                          locale: 'fr-fr',
                          duration: '00:03:31',
                        },
                      ],
                    },
                    {
                      id: 'recSkillId2',
                      nom: '@skill2',
                      level: 2,
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      await mockLearningContent(learningContentObjects);
    });

    it('should return the campaign participation analyses', async function () {
      // given
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/analyses`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
      const expectedCampaignParticipationAnalysis = {
        data: {
          type: 'campaign-analyses',
          id: campaignId.toString(),
          attributes: {},
          relationships: {
            'campaign-tube-recommendations': {
              data: [
                {
                  id: `${campaignId}_recTube1`,
                  type: 'campaignTubeRecommendations',
                },
              ],
            },
          },
        },
        included: [
          {
            id: 'recTutorial1',
            type: 'tutorials',
            attributes: {
              duration: '00:03:31',
              format: '2 mois',
              id: 'recTutorial1',
              link: 'www.liberez-moi.fr',
              source: 'covid-19',
              title: 'Apprendre à vivre confiné',
            },
          },
          {
            id: `${campaignId}_recTube1`,
            type: 'campaignTubeRecommendations',
            attributes: {
              'area-color': 'specialColor',
              'tube-id': 'recTube1',
              'competence-id': 'recCompetence1',
              'competence-name': 'Fabriquer un meuble',
              'tube-practical-title': 'Monter une étagère',
              'tube-description': 'Comment monter une étagère',
              'average-score': 30,
            },
            relationships: {
              tutorials: {
                data: [
                  {
                    id: 'recTutorial1',
                    type: 'tutorials',
                  },
                ],
              },
            },
          },
        ],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedCampaignParticipationAnalysis);
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}', function () {
    it('should return the assessment participation', async function () {
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Maitre Yoda',
        campaignId,
        organizationLearnerId: organizationLearner.id,
      });
      databaseBuilder.factory.buildAssessment({
        userId: organizationLearner.userId,
        campaignParticipationId: campaignParticipation.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/assessment-participations/${campaignParticipation.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const assessmentParticipation = response.result.data.attributes;
      expect(assessmentParticipation['participant-external-id']).to.equal('Maitre Yoda');
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}/results', function () {
    beforeEach(async function () {
      const learningContent = [
        {
          id: 'recArea1',
          title_i18n: {
            fr: 'area1_Title',
          },
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: { fr: 'Fabriquer un meuble' },
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkillId1',
                      nom: '@web2',
                      challenges: [],
                    },
                    {
                      id: 'recSkillId2',
                      nom: '@web3',
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      await mockLearningContent(learningContentObjects);
    });

    it('should return the assessment participation results', async function () {
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Maitre Yoda',
        campaignId,
        organizationLearnerId: organizationLearner.id,
      });
      databaseBuilder.factory.buildAssessment({
        userId: organizationLearner.userId,
        campaignParticipationId: campaignParticipation.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/assessment-participations/${campaignParticipation.id}/results`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('campaign-assessment-participation-results');
    });
  });

  describe('GET /api/campaigns/{campaignId}/organization-learners/{organizationLearnerId}/participations', function () {
    beforeEach(async function () {
      const learningObjects = learningContentBuilder.fromAreas([]);
      await mockLearningContent(learningObjects);
    });

    it('should return the campaign profile as JSONAPI', async function () {
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
      }).id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/organization-learners/${organizationLearnerId}/participations`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.result.data[0].type).to.equal('available-campaign-participations');
      expect(response.result.data[0].id).to.equal(`${campaignParticipationId}`);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/admin/campaign-participations/{id}', function () {
    it('should update the participant external id', async function () {
      const superAdmin = await insertUserWithRoleSuperAdmin();

      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Maitre Yoda',
        campaignId,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/campaign-participations/${campaignParticipation.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            id: campaignParticipation.id,
            attributes: {
              'participant-external-id': 'Dark Vador',
            },
            type: 'campaign-participations',
          },
        },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(204);
      const { participantExternalId: updatedParticipantExternalId } = await knex('campaign-participations')
        .select('participantExternalId')
        .where('id', campaignParticipation.id)
        .first();
      expect(updatedParticipantExternalId).to.equal('Dark Vador');
    });
  });

  describe('GET /api/admin/campaigns/{campaignId}/participations', function () {
    it('should return participations', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/campaigns/${campaign.id}/participations`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].id).to.equal(campaignParticipation.id.toString());
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/assessment-result', function () {
    const JAFFA_COLOR = 'jaffa';
    const EMERALD_COLOR = 'emerald';
    const WILD_STRAWBERRY_COLOR = 'wild-strawberry';

    let user, campaign, assessment, campaignParticipation, targetProfile, campaignSkills;

    let server, badge1, badge2, stage;

    beforeEach(async function () {
      server = await createServer();

      const oldDate = new Date('2018-02-03');
      const recentDate = new Date('2018-05-06');
      const futureDate = new Date('2018-07-10');
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

      user = databaseBuilder.factory.buildUser();
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      campaign = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile.id,
      });
      campaignSkills = times(8, (index) => {
        return databaseBuilder.factory.buildCampaignSkill({
          campaignId: campaign.id,
          skillId: skillIds[index],
        });
      });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: user.id,
        sharedAt: recentDate,
        masteryRate: 0.38,
      });

      assessment = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: 'CAMPAIGN',
        state: 'completed',
      });

      badge1 = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'Low threshold badge',
        imageUrl: '/img/banana.svg',
        message: 'You won a badge that had a criterion threshold set at 0',
        title: 'Badge 1',
        key: 'PIX_BADGE_1',
        targetProfileId: targetProfile.id,
        isAlwaysVisible: true,
      });

      badge2 = databaseBuilder.factory.buildBadge({
        id: 2,
        altMessage: 'High threshold badge',
        imageUrl: '/img/banana.svg',
        message: 'You won a badge that had a criterion threshold set at 90',
        title: 'Badge 2',
        key: 'PIX_BADGE_2',
        targetProfileId: targetProfile.id,
        isAlwaysVisible: true,
      });

      databaseBuilder.factory.buildBadgeCriterion({
        badgeId: 1,
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 0,
      });

      databaseBuilder.factory.buildBadgeCriterion({
        badgeId: 2,
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 90,
      });

      databaseBuilder.factory.buildBadgeAcquisition({
        userId: user.id,
        campaignParticipationId: campaignParticipation.id,
        badgeId: badge1.id,
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

      databaseBuilder.factory.buildStageAcquisition({
        stageId: stage.id,
        userId: user.id,
        campaignParticipationId: campaignParticipation.id,
      });

      campaignSkills.slice(2).forEach((campaignSkill, index) => {
        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          assessmentId: assessment.id,
          skillId: campaignSkill.skillId,
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

      const learningContent = [
        {
          id: 'recArea1',
          title_i18n: { fr: 'DomaineNom1' },
          color: JAFFA_COLOR,
          competences: [
            {
              id: 1,
              name_i18n: { fr: 'Agir collectivement' },
              description_i18n: { fr: 'Sauver le monde' },
              index: '1.2',
              tubes: [{ id: 'recTube1', skills: [{ id: 'recSkill1' }] }],
            },
          ],
        },
        {
          id: 'recArea2',
          title_i18n: { fr: 'DomaineNom2' },
          color: EMERALD_COLOR,
          competences: [
            {
              id: 2,
              name_i18n: { fr: 'Nécessité de la pensée radicale' },
              description_i18n: { fr: 'Sauver le monde' },
              index: '2.1',
              tubes: [
                {
                  id: 'recTube2',
                  skills: [{ id: 'recSkill2' }, { id: 'recSkill3' }, { id: 'recSkill4' }],
                },
              ],
            },
            {
              id: 3,
              name_i18n: { fr: 'Changer efficacement le monde' },
              description_i18n: { fr: 'Sauver le monde' },
              index: '2.2',
              tubes: [
                {
                  id: 'recTube3',
                  skills: [{ id: 'recSkill5' }, { id: 'recSkill6' }, { id: 'recSkill7' }, { id: 'recSkill8' }],
                },
              ],
            },
          ],
        },
        {
          id: 'recArea3',
          title_i18n: { fr: 'DomaineNom3' },
          color: WILD_STRAWBERRY_COLOR,
          competences: [
            {
              id: 4,
              name_i18n: { fr: 'Oser la paresse' },
              description_i18n: { fr: 'Sauver le monde' },
              index: '4.3',
              tubes: [{ id: 'recTube0', skills: [{ id: 'notIncludedSkillId' }] }],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      await mockLearningContent(learningContentObjects);
      await databaseBuilder.commit();
    });

    it('should return the campaign assessment result', async function () {
      // given
      const expectedResponse = {
        data: {
          type: 'campaign-participation-results',
          id: campaignParticipation.id.toString(),
          attributes: {
            'mastery-rate': 0.38,
            'total-skills-count': 8,
            'tested-skills-count': 5,
            'validated-skills-count': 3,
            'is-completed': true,
            'is-shared': true,
            'can-retry': false,
            'can-reset': false,
            'can-improve': false,
            'is-disabled': false,
            'participant-external-id': 'participantExternalId',
          },
          relationships: {
            'campaign-participation-badges': {
              data: [
                {
                  id: `${badge1.id}`,
                  type: 'campaignParticipationBadges',
                },
                {
                  id: `${badge2.id}`,
                  type: 'campaignParticipationBadges',
                },
              ],
            },
            'competence-results': {
              data: [
                {
                  id: '1',
                  type: 'competenceResults',
                },
                {
                  id: '2',
                  type: 'competenceResults',
                },
                {
                  id: '3',
                  type: 'competenceResults',
                },
              ],
            },
            'reached-stage': {
              data: {
                id: `${stage.id}`,
                type: 'reached-stages',
              },
            },
          },
        },
        included: [
          {
            attributes: {
              'acquisition-percentage': 100,
              'alt-message': 'Low threshold badge',
              'image-url': '/img/banana.svg',
              'is-acquired': true,
              'is-always-visible': true,
              'is-certifiable': false,
              'is-valid': true,
              key: 'PIX_BADGE_1',
              title: 'Badge 1',
              message: 'You won a badge that had a criterion threshold set at 0',
            },
            id: '1',
            type: 'campaignParticipationBadges',
          },
          {
            attributes: {
              'acquisition-percentage': 42,
              'alt-message': 'High threshold badge',
              'image-url': '/img/banana.svg',
              'is-acquired': false,
              'is-always-visible': true,
              'is-certifiable': false,
              'is-valid': false,
              key: 'PIX_BADGE_2',
              title: 'Badge 2',
              message: 'You won a badge that had a criterion threshold set at 90',
            },
            id: '2',
            type: 'campaignParticipationBadges',
          },
          {
            type: 'competenceResults',
            id: '1',
            attributes: {
              name: 'Agir collectivement',
              index: '1.2',
              description: 'Sauver le monde',
              'mastery-percentage': 0,
              'total-skills-count': 1,
              'tested-skills-count': 0,
              'validated-skills-count': 0,
              'area-color': JAFFA_COLOR,
              'area-title': 'DomaineNom1',
              'reached-stage': 0,
            },
          },
          {
            type: 'competenceResults',
            id: '2',
            attributes: {
              name: 'Nécessité de la pensée radicale',
              index: '2.1',
              description: 'Sauver le monde',
              'mastery-percentage': 67,
              'total-skills-count': 3,
              'tested-skills-count': 2,
              'validated-skills-count': 2,
              'area-color': EMERALD_COLOR,
              'area-title': 'DomaineNom2',
              'reached-stage': 2,
            },
          },
          {
            type: 'competenceResults',
            id: '3',
            attributes: {
              name: 'Changer efficacement le monde',
              index: '2.2',
              description: 'Sauver le monde',
              'mastery-percentage': 25,
              'total-skills-count': 4,
              'tested-skills-count': 3,
              'validated-skills-count': 1,
              'area-color': EMERALD_COLOR,
              'area-title': 'DomaineNom2',
              'reached-stage': 1,
            },
          },
          {
            attributes: {
              message: 'Tu as le palier 1',
              title: 'palier 1',
              threshold: 20,
              'reached-stage': 1,
              'total-stage': 2,
            },
            id: stage.id.toString(),
            type: 'reached-stages',
          },
        ],
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/users/${user.id}/campaigns/${campaign.id}/assessment-result`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });

      // then
      expect(response.result).to.deep.equal(expectedResponse);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /users/{userId}/campaign-participation-overviews', function () {
    let userId;
    let options;

    beforeEach(function () {
      const user = databaseBuilder.factory.buildUser();
      userId = user.id;

      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkillId1',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);

      return databaseBuilder.commit();
    });

    it('should return participation which match with filters', async function () {
      // given
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      const startedCampaignParticipation = databaseBuilder.factory.campaignParticipationOverviewFactory.buildOnGoing({
        userId,
        campaignSkills: ['recSkillId1'],
      });
      const sharableCampaignParticipation = databaseBuilder.factory.campaignParticipationOverviewFactory.buildToShare({
        userId,
        campaignSkills: ['recSkillId1'],
      });
      databaseBuilder.factory.campaignParticipationOverviewFactory.buildEnded({
        userId,
        campaignSkills: ['recSkillId1'],
      });

      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaign-participation-overviews?filter[states][]=ONGOING&filter[states][]=TO_SHARE`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const participationIds = response.result.data.map(({ id }) => Number(id));
      expect(participationIds).to.deep.equals([sharableCampaignParticipation.id, startedCampaignParticipation.id]);
    });
  });

  describe('GET /users/{userId}/anonymised-campaign-assessments', function () {
    let userId;
    let options;
    const skillId = 'recSkillId';

    beforeEach(function () {
      const user = databaseBuilder.factory.buildUser();
      userId = user.id;

      databaseBuilder.factory.learningContent.buildSkill({ id: skillId });

      return databaseBuilder.commit();
    });

    it('should return anonymised campaign assessment', async function () {
      // given
      const deletedCampaignParticipation =
        databaseBuilder.factory.campaignParticipationOverviewFactory.buildDeletedAndAnonymised({
          userId,
          createdAt: new Date('2021-01-12'),
          sharedAt: new Date('2021-01-14'),
          deleted: new Date('2023-12-24'),
          assessmentCreatedAt: new Date('2021-01-12'),
          campaignSkills: [skillId],
        });

      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/users/${userId}/anonymised-campaign-assessments`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const assessmentIds = response.result.data.map(({ id }) => Number(id));
      expect(assessmentIds).to.deep.equals([deletedCampaignParticipation.assessment.id]);
    });
  });

  describe('GET /users/{userId}/campaigns/{campaignId}/campaign-participations', function () {
    let options;

    beforeEach(function () {
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        status: 'SHARED',
      });

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaigns/${campaignId}/campaign-participations`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      return databaseBuilder.commit();
    });

    it('should return campaign participation with 200 HTTP status code', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
