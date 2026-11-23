import { expect } from 'chai';

import { CampaignParticipationResult } from '../../../../../src/lti/domain/models/CampaignParticipationResult.js';
import { repositories } from '../../../../../src/lti/infrastructure/repositories/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.ts';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../src/shared/domain/errors.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | LTI | Infrastructure | Repository | lti-campaign-participation', function () {
  describe('#getAssessmentCampaignResult', function () {
    let campaignId;

    beforeEach(async function () {
      await databaseBuilder.factory.learningContent.build({
        frameworks: [{ id: 'frameworkId', name: 'frameworkName' }],
        areas: [{ id: 'recArea1', frameworkId: 'frameworkId', competenceIds: ['recCompetence1', 'recCompetence2'] }],
        competences: [
          {
            id: 'recCompetence1',
            name_i18n: { fr: 'Mener une recherche', en: 'Conduct a search' },
            description_i18n: { fr: 'description 1', en: 'description 1 EN' },
            index: '1.1',
            skillIds: ['recSkill1', 'recSkill2'],
            areaId: 'recArea1',
            origin: 'Pix',
          },
          {
            id: 'recCompetence2',
            name_i18n: { fr: 'Gérer des données', en: 'Manage data' },
            description_i18n: { fr: 'description 2', en: 'description 2 EN' },
            index: '1.2',
            skillIds: ['recSkill3'],
            areaId: 'recArea1',
            origin: 'Pix',
          },
        ],
        thematics: [],
        tubes: [
          {
            id: 'recTube1',
            name: '@tube1',
            practicalTitle_i18n: { fr: 'Sujet 1', en: 'Tube 1' },
            practicalDescription_i18n: { fr: 'Sujet 1 desc', en: 'Tube 1 desc' },
            competenceId: 'recCompetence1',
            skillIds: ['recSkill1', 'recSkill2'],
          },
          {
            id: 'recTube2',
            name: '@tube2',
            practicalTitle_i18n: { fr: 'Sujet 2', en: 'Tube 2' },
            practicalDescription_i18n: { fr: 'Sujet 2 desc', en: 'Tube 2 desc' },
            competenceId: 'recCompetence2',
            skillIds: ['recSkill3'],
          },
        ],
        skills: [
          {
            id: 'recSkill1',
            name: '@tube1',
            tubeId: 'recTube1',
            status: 'actif',
            level: 1,
            competenceId: 'recCompetence1',
          },
          {
            id: 'recSkill2',
            name: '@tube2',
            tubeId: 'recTube1',
            status: 'actif',
            level: 2,
            competenceId: 'recCompetence1',
          },
          {
            id: 'recSkill3',
            name: '@tube3',
            tubeId: 'recTube2',
            status: 'actif',
            level: 3,
            competenceId: 'recCompetence2',
          },
        ],
        challenges: [],
      });

      campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
      ['recSkill1', 'recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }),
      );
      await databaseBuilder.commit();
    });

    it('returns the mastery rate and the competence results of a shared participation', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: CampaignParticipationStatuses.SHARED,
        masteryRate: 0.33,
      });
      const validatedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkill1',
        userId: campaignParticipation.userId,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: campaignParticipation.id,
        snapshot: new KnowledgeElementCollection([validatedKnowledgeElement]).toSnapshot(),
      });
      await databaseBuilder.commit();

      // when
      const result = await repositories.ltiCampaignParticipationRepository.getCampaignParticipationResult({
        campaignParticipationId: campaignParticipation.id,
      });

      // then
      expect(result).to.be.an.instanceOf(CampaignParticipationResult);
      expect(result).to.deep.equal(
        new CampaignParticipationResult({
          campaignParticipationId: campaignParticipation.id,
          masteryRate: 0.33,
          competences: [
            { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 2, reachedLevel: 1 },
            { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 3, reachedLevel: 0 },
          ],
        }),
      );
    });

    it('returns competence names in the given locale', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: campaignParticipation.id,
        snapshot: new KnowledgeElementCollection([]).toSnapshot(),
      });
      await databaseBuilder.commit();

      // when
      const result = await repositories.ltiCampaignParticipationRepository.getCampaignParticipationResult({
        campaignParticipationId: campaignParticipation.id,
        locale: 'en',
      });

      // then
      expect(result.competences.map(({ name }) => name)).to.deep.equal(['Conduct a search', 'Manage data']);
    });

    context('when participation is not shared', function () {
      it('throws a UserNotAuthorizedToAccessEntityError', async function () {
        // given
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          status: CampaignParticipationStatuses.STARTED,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(repositories.ltiCampaignParticipationRepository.getCampaignParticipationResult)({
          campaignParticipationId: campaignParticipation.id,
        });

        // then
        expect(error).to.be.an.instanceOf(UserNotAuthorizedToAccessEntityError);
      });
    });
  });

  describe('#save', function () {
    let clientId, campaignId;

    beforeEach(async function () {
      const platform = databaseBuilder.factory.buildLtiPlatform();
      clientId = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId: platform.id }).clientId;
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    it('inserts an LTI campaign participation', async function () {
      // when
      await repositories.ltiCampaignParticipationRepository.save({
        clientId,
        platformUserSub: '1234',
        lineItemContainerUrl: 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
        campaignId,
      });

      // then
      const rows = await knex('lti_campaign_participations').select(
        'clientId',
        'platformUserSub',
        'lineItemContainerUrl',
        'campaignId',
      );
      expect(rows).to.deep.equal([
        {
          clientId,
          platformUserSub: '1234',
          lineItemContainerUrl: 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
          campaignId,
        },
      ]);
    });

    describe('when the participation already exists', function () {
      it('does nothing', async function () {
        // given
        const existingParticipation = databaseBuilder.factory.buildLtiCampaignParticipation({ clientId, campaignId });
        await databaseBuilder.commit();

        // when
        await repositories.ltiCampaignParticipationRepository.save({
          clientId: existingParticipation.clientId,
          platformUserSub: existingParticipation.platformUserSub,
          lineItemContainerUrl: existingParticipation.lineItemContainerUrl,
          campaignId: existingParticipation.campaignId,
        });

        // then
        const rows = await knex('lti_campaign_participations');
        expect(rows).to.deep.equal([existingParticipation]);
      });
    });

    describe('when the user participates to another campaign in the same course', function () {
      it('inserts another LTI campaign participation', async function () {
        // given
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        const participation = {
          clientId,
          platformUserSub: '1234',
          lineItemContainerUrl: 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
        };
        databaseBuilder.factory.buildLtiCampaignParticipation({ ...participation, campaignId });
        await databaseBuilder.commit();

        // when
        await repositories.ltiCampaignParticipationRepository.save({ ...participation, campaignId: otherCampaignId });

        // then
        const campaignIds = await knex('lti_campaign_participations').pluck('campaignId');
        expect(campaignIds).to.have.members([campaignId, otherCampaignId]);
      });
    });

    describe('when the user participates to the same campaign in two different courses', function () {
      it('inserts another LTI campaign participation', async function () {
        // given
        const participation = { clientId, platformUserSub: '1234', campaignId };
        databaseBuilder.factory.buildLtiCampaignParticipation({
          ...participation,
          lineItemContainerUrl: 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
        });
        await databaseBuilder.commit();

        // when
        await repositories.ltiCampaignParticipationRepository.save({
          ...participation,
          lineItemContainerUrl: 'https://moodle.example.net/mod/lti/services.php/5/lineitems?type_id=3',
        });

        // then
        const lineItemContainerUrls = await knex('lti_campaign_participations').pluck('lineItemContainerUrl');
        expect(lineItemContainerUrls).to.have.members([
          'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
          'https://moodle.example.net/mod/lti/services.php/5/lineitems?type_id=3',
        ]);
      });
    });
  });
});
