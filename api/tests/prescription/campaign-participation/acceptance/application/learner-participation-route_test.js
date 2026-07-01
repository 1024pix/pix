import _ from 'lodash';

import { createServer } from '../../../../../server.js';
import { ParticipationResultCalculationJob } from '../../../../../src/prescription/campaign-participation/domain/models/ParticipationResultCalculationJob.js';
import { ParticipationSharedJob } from '../../../../../src/prescription/campaign-participation/domain/models/ParticipationSharedJob.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_SCORE } from '../../../../../src/shared/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { buildLearningContent } from '../../../../tooling/learning-content-builder/build-learning-content.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const { SHARED, STARTED } = CampaignParticipationStatuses;

describe('Acceptance | Routes | Campaign Participations', function () {
  let server, options, user;

  beforeEach(async function () {
    server = await createServer();
    user = databaseBuilder.factory.buildUser();
  });

  describe('PATCH /api/campaign-participations/{campaignParticipationId}', function () {
    let campaignParticipationId;

    beforeEach(async function () {
      campaignParticipationId = 123111;

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
                      id: 'recAcquisWeb1',
                      nom: '@web1',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningObjects);
      await databaseBuilder.commit();

      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipationId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };
    });

    it('shares the campaign participation', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recAcquisWeb1' });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId,
        userId: user.id,
        status: STARTED,
        sharedAt: null,
        campaignId: campaign.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.COMPLETED,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);
      const result = await knex('campaign-participations').first();

      // then
      expect(response.statusCode).to.equal(204);
      expect(result.status).to.equal(SHARED);

      await expect(ParticipationResultCalculationJob.name).to.have.been.performed.withJobsCount(1);
      await expect(ParticipationSharedJob.name).to.have.been.performed.withJobsCount(1);
    });
  });

  describe('POST /api/campaign-participations', function () {
    let campaignId;
    let multipleSendingsCampaignId;
    let assessmentId;

    const options = {
      method: 'POST',
      url: '/api/campaign-participations',
      payload: {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': 'iuqezfh13736',
          },
          relationships: {
            campaign: {
              data: {
                id: null,
                type: 'campaigns',
              },
            },
          },
        },
      },
    };

    beforeEach(async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });
      options.headers = generateAuthenticatedUserRequestHeaders({ userId: user.id });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile({ areKnowledgeElementsResettable: true }).id;
      databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeId1', targetProfileId });
      databaseBuilder.factory.buildKnowledgeElement({
        userId: user.id,
        skillId: 'recSK123',
        status: KnowledgeElement.StatusType.VALIDATED,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId: user.id,
        skillId: 'recSK789',
        status: KnowledgeElement.StatusType.VALIDATED,
      });

      const competenceId = 'competenceId';
      assessmentId = databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.COMPETENCE_EVALUATION,
        state: Assessment.states.COMPLETED,
      }).id;
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        assessmentId,
        competenceId,
      });

      campaignId = databaseBuilder.factory.buildCampaign({
        targetProfileId,
        organizationId: organizationLearner.organizationId,
        type: 'ASSESSMENT',
        multipleSendings: false,
      }).id;

      multipleSendingsCampaignId = databaseBuilder.factory.buildCampaign({
        targetProfileId,
        organizationId: organizationLearner.organizationId,
        type: 'ASSESSMENT',
        multipleSendings: true,
      }).id;

      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        organizationLeaner: organizationLearner.id,
        campaignId: multipleSendingsCampaignId,
        status: CampaignParticipationStatuses.SHARED,
      });

      const framework = domainBuilder.buildFramework({ id: 'frameworkId', name: 'someFramework' });
      const skill1 = {
        id: 'recSK123',
        name: '@sau3',
        pixValue: 3,
        competenceId,
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId1',
        version: 1,
        level: 3,
      };
      const tube1 = domainBuilder.buildTube({ id: 'tubeId1', competenceId, skills: [skill1] });
      const area = domainBuilder.buildArea({ id: 'areaId', frameworkId: framework.id });
      const competence = domainBuilder.buildCompetence({ id: 'competenceId', area, tubes: [tube1] });
      const thematic = domainBuilder.buildThematic({
        id: 'thematicId',
        competenceId: 'competenceId',
        tubeIds: ['tubeId1'],
      });
      competence.thematics = [thematic];
      area.competences = [competence];
      framework.areas = [area];
      const learningContent = buildLearningContent([framework]);
      databaseBuilder.factory.learningContent.build(learningContent);

      await databaseBuilder.commit();
    });

    it('should return 201 and the campaign participation when it has been successfully created', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });

    it('should reset the campaign participation', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = multipleSendingsCampaignId;
      options.payload.data.attributes['is-reset'] = true;

      // when
      await server.inject(options);

      // then
      const ke = await knex('knowledge-elements').where({
        userId: user.id,
        status: KnowledgeElement.StatusType.RESET,
        skillId: 'recSK123',
      });
      const { state: assessmentState } = await knex('assessments').where({ id: assessmentId }).first();

      expect(ke).to.have.lengthOf(1);
      expect(assessmentState).to.equal(Assessment.states.STARTED);
    });

    it('should return a 412 if the user already participated to the campaign', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;

      // when
      await server.inject(options);
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(412);
      expect(response.result.errors[0].detail).to.equal(
        `User ${user.id} has already a campaign participation with campaign ${campaignId}`,
      );
    });

    it('should return 404 error if the campaign related to the participation does not exist', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = null;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 412 error if the user has already participated to the campaign', async function () {
      // given
      options.payload.data.relationships.campaign.data.id = campaignId;
      databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, campaignId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(412);
    });
  });

  describe('GET /users/{userId}/campaigns/{campaignId}/profile', function () {
    const competenceId = 'recAbe382T0e1337';
    const createdAt = new Date('2019-01-01');
    const createdAfterAt = new Date('2019-01-03');
    const sharedAt = new Date('2019-01-02');
    const pixScore = 2;
    let campaignParticipation, userId;

    const learningContent = {
      areas: [
        {
          id: 'recvoGdo7z2z7pXWa',
          title_i18n: {
            fr: 'Information et données',
          },
          color: 'jaffa',
          code: '1',
          competenceIds: [competenceId],
        },
      ],
      competences: [
        {
          id: competenceId,
          name_i18n: {
            fr: 'Mener une recherche et une veille d’information',
          },
          description_i18n: {
            fr: 'Mener une recherche et une veille d’information description',
          },
          index: '1.1',
          origin: 'Pix',
          areaId: 'recvoGdo7z2z7pXWa',
        },
      ],
    };

    beforeEach(async function () {
      databaseBuilder.factory.learningContent.build(learningContent);
      userId = 100;
      databaseBuilder.factory.buildUser({ id: userId });
      const campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign.id,
        sharedAt,
        pixScore,
      });

      const knowledgeElements = [
        {
          skillId: 'url1',
          status: 'validated',
          source: 'direct',
          competenceId,
          earnedPix: 2,
          createdAt,
          userId,
        },
        {
          skillId: 'url2',
          status: 'validated',
          source: 'direct',
          competenceId,
          earnedPix: 2,
          createdAt: createdAfterAt,
          userId,
        },
      ];
      _.each(knowledgeElements, (ke) => databaseBuilder.factory.buildKnowledgeElement(ke));

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaigns/${campaign.id}/profile`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
    });

    it('should return score cards for the shared profile with 200 HTTP status code', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          id: String(campaignParticipation.id),
          attributes: {
            'pix-score': 2,
            'shared-at': sharedAt,
            'can-retry': false,
            'max-reachable-level': MAX_REACHABLE_LEVEL,
            'max-reachable-pix-score': MAX_REACHABLE_PIX_SCORE,
          },
          relationships: {
            scorecards: {
              data: [
                {
                  id: '100_recAbe382T0e1337',
                  type: 'scorecards',
                },
              ],
            },
          },
          type: 'SharedProfileForCampaigns',
        },
        included: [
          {
            attributes: {
              code: '1',
              color: 'jaffa',
              title: 'Information et données',
            },
            id: 'recvoGdo7z2z7pXWa',
            type: 'areas',
          },
          {
            attributes: {
              'competence-id': 'recAbe382T0e1337',
              description: 'Mener une recherche et une veille d’information description',
              'earned-pix': 2,
              index: '1.1',
              level: 0,
              name: 'Mener une recherche et une veille d’information',
              'pix-score-ahead-of-next-level': 2,
              status: 'STARTED',
            },
            id: '100_recAbe382T0e1337',
            relationships: {
              area: {
                data: {
                  id: 'recvoGdo7z2z7pXWa',
                  type: 'areas',
                },
              },
            },
            type: 'scorecards',
          },
        ],
      });
    });
  });
});
