import { PassThrough } from 'node:stream';
import { text } from 'node:stream/consumers';

import dayjs from 'dayjs';
import sinon from 'sinon';

import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { CampaignExternalIdTypes, CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { CAMPAIGN_FEATURES, ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', function () {
  describe('#startWritingCampaignAssessmentResultsToStream', function () {
    let organization;
    let targetProfile;
    let participant;
    let campaign;
    let campaignParticipation;
    let organizationLearner;
    let writableStream;
    let i18n;
    let createdAt, sharedAt, createdAtFormated, sharedAtFormated;
    let now;
    let stageIds;

    beforeEach(async function () {
      i18n = getI18n();
      organization = databaseBuilder.factory.buildOrganization({ showSkills: true });

      // Profil cible
      targetProfile = databaseBuilder.factory.buildTargetProfile({
        name: '+Profile 1',
        organizationId: organization.id,
      });
      stageIds = [
        databaseBuilder.factory.buildStage({
          targetProfileId: targetProfile.id,
          threshold: 0,
          message: '0',
          title: '0',
        }).id,
        databaseBuilder.factory.buildStage({
          targetProfileId: targetProfile.id,
          threshold: 1,
          message: '1',
          title: '1',
        }).id,
      ];

      databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });

      // participation
      // heure d'hiver UTC+1
      createdAt = new Date('2019-02-25T10:20:00Z');
      createdAtFormated = '25/02/2019 11:20';
      // heure d'été UTC+2
      sharedAt = new Date('2019-06-01T09:05:00Z');
      sharedAtFormated = '01/06/2019 11:05';
      const learningContent = {
        frameworks: [{ id: 'frameworkId', name: 'frameworkName' }],
        areas: [{ id: 'recArea1', frameworkId: 'frameworkId', competenceIds: ['recCompetence1'] }],
        competences: [
          {
            id: 'recCompetence1',
            index: '1.1',
            skillIds: ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'],
            areaId: 'recArea1',
            origin: 'Pix',
          },
        ],
        thematics: [],
        tubes: [{ id: 'recTube1', competenceId: 'recCompetence1' }],
        skills: [
          { id: 'recSkillWeb1', name: '@web1', tubeId: 'recTube1', status: 'actif', competenceId: 'recCompetence1' },
          { id: 'recSkillWeb2', name: '@web2', tubeId: 'recTube1', status: 'actif', competenceId: 'recCompetence1' },
          { id: 'recSkillWeb3', name: '@web3', tubeId: 'recTube1', status: 'actif', competenceId: 'recCompetence1' },
        ],
        challenges: [],
      };
      databaseBuilder.factory.learningContent.build(learningContent);
      await databaseBuilder.commit();

      writableStream = new PassThrough();
    });

    [
      { type: CampaignTypes.ASSESSMENT },

      { type: CampaignTypes.EXAM },
    ].forEach(function ({ type }) {
      context(`campaign of type ${type}`, function () {
        beforeEach(function () {
          const user = databaseBuilder.factory.buildUser();
          // campagne
          campaign = databaseBuilder.factory.buildCampaign({
            name: '@Campagne de Test N°1',
            code: 'AZERTY123',
            organizationId: organization.id,
            type,
            targetProfileId: targetProfile.id,
            creatorId: user.id,
            ownerId: user.id,
          });
        });

        context('general context', function () {
          beforeEach(async function () {
            now = new Date('1992-07-07');
            sinon.useFakeTimers({ now, toFake: ['Date'] });
            const externalIdFeature = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID);
            databaseBuilder.factory.buildCampaignFeature({
              featureId: externalIdFeature.id,
              campaignId: campaign.id,
              params: { label: 'Identifiant Pix', type: CampaignExternalIdTypes.STRING },
            });
            participant = databaseBuilder.factory.buildUser();
            organizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: '@Jean',
              lastName: '=Bono',
              organizationId: organization.id,
              userId: participant.id,
            });

            ['recSkillWeb1'].forEach((skillId) => {
              databaseBuilder.factory.buildCampaignSkill({
                campaignId: campaign.id,
                skillId: skillId,
              });
            });

            await databaseBuilder.commit();
          });

          it('should return the correct filename', async function () {
            // when
            const filename = await usecases.startWritingCampaignAssessmentResultsToStream({
              campaignId: campaign.id,
              writableStream,
              i18n,
            });

            const expectedFilename =
              'Resultats-' +
              campaign.name +
              '-' +
              campaign.id +
              '-' +
              dayjs(now).tz('Europe/Berlin').format('YYYY-MM-DD-HHmm') +
              '.csv';
            // then
            expect(filename.fileName).to.equal(expectedFilename);
          });
        });

        context('with externalId campaign feature', function () {
          beforeEach(async function () {
            const externalIdFeature = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID);
            databaseBuilder.factory.buildCampaignFeature({
              featureId: externalIdFeature.id,
              campaignId: campaign.id,
              params: { label: 'Identifiant Pix', type: CampaignExternalIdTypes.STRING },
            });
            participant = databaseBuilder.factory.buildUser();
            organizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: '@Jean',
              lastName: '=Bono',
              organizationId: organization.id,
              userId: participant.id,
            });

            campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              organizationLearnerId: organizationLearner.id,
              userId: participant.id,
              participantExternalId: 'toto',
              masteryRate: 0.67,
              createdAt,
              sharedAt,
            });

            databaseBuilder.factory.buildStageAcquisition({
              stageId: stageIds[0],
              campaignParticipationId: campaignParticipation.id,
            });

            databaseBuilder.factory.buildAssessment({
              campaignParticipationId: campaignParticipation.id,
              userId: participant.id,
              state: Assessment.states.COMPLETED,
              type: Assessment.types.CAMPAIGN,
            });

            const ke1 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb1',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke2 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb2',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke3 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'invalidated',
              skillId: 'recSkillWeb3',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            databaseBuilder.factory.buildKnowledgeElementSnapshot({
              campaignParticipationId: campaignParticipation.id,
              snapshot: new KnowledgeElementCollection([ke1, ke2, ke3]).toSnapshot(),
            });

            ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'].forEach((skillId) => {
              databaseBuilder.factory.buildCampaignSkill({
                campaignId: campaign.id,
                skillId: skillId,
              });
            });

            await databaseBuilder.commit();
          });

          it('should return the complete line with participant external id', async function () {
            // given
            let csvSecondLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"'${campaign.name}";` +
              `"'${targetProfile.name}";` +
              `"'${organizationLearner.lastName}";` +
              `"'${organizationLearner.firstName}";` +
              `"${campaignParticipation.participantExternalId}";`;
            csvSecondLine += '1;';
            csvSecondLine +=
              `"${createdAtFormated}";` +
              '"Oui";' +
              `"${sharedAtFormated}";` +
              '0;' +
              '"Non";' +
              '0,67;' +
              '0,67;' +
              '3;' +
              '2;' +
              '0,67;' +
              '3;' +
              '2;' +
              '"OK";' +
              '"OK";' +
              '"KO"';

            // when
            await usecases.startWritingCampaignAssessmentResultsToStream({
              campaignId: campaign.id,
              writableStream,
              i18n,
            });

            const csv = await text(writableStream);
            const csvLines = csv.split('\n');
            const csvFirstLineCells = csvLines[0].split(';');

            // then
            expect(csvFirstLineCells).to.includes('"Identifiant Pix"');
            expect(csvLines[1]).to.equal(csvSecondLine);
          });
        });

        context('extra rows', function () {
          beforeEach(async function () {
            // Import Configuration
            const importConfig = {
              name: 'MY_TEST_EXPORT',
              fileType: 'csv',
              config: {
                acceptedEncoding: ['utf-8'],
                unicityColumns: ['my_column1'],
                validationRules: {
                  formats: [
                    { name: 'my_column1', type: 'string' },
                    { name: 'my_column2', type: 'string' },
                  ],
                },
                headers: [
                  { name: 'my_column1', required: true, property: 'lastName' },
                  { name: 'my_column2', required: true, property: 'firstName' },
                  { name: 'hobby', required: true, config: { exportable: true } },
                ],
              },
            };
            const feature = databaseBuilder.factory.buildFeature({
              key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
            });
            const organizationLearnerImportFormatId =
              databaseBuilder.factory.buildOrganizationLearnerImportFormat(importConfig).id;

            databaseBuilder.factory.buildOrganizationFeature({
              featureId: feature.id,
              organizationId: organization.id,
              params: { organizationLearnerImportFormatId },
            });
            participant = databaseBuilder.factory.buildUser();
            organizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: '@Jean',
              lastName: '=Bono',
              organizationId: organization.id,
              userId: participant.id,
              attributes: { hobby: 'genky', sleep: '8h' },
            });

            campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              organizationLearnerId: organizationLearner.id,
              userId: participant.id,
              masteryRate: 0.67,
              createdAt,
              sharedAt,
            });

            databaseBuilder.factory.buildStageAcquisition({
              stageId: stageIds[0],
              campaignParticipationId: campaignParticipation.id,
            });

            databaseBuilder.factory.buildAssessment({
              campaignParticipationId: campaignParticipation.id,
              userId: participant.id,
              state: Assessment.states.COMPLETED,
              type: Assessment.types.CAMPAIGN,
            });

            const ke1 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb1',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke2 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb2',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke3 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'invalidated',
              skillId: 'recSkillWeb3',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            databaseBuilder.factory.buildKnowledgeElementSnapshot({
              campaignParticipationId: campaignParticipation.id,
              snapshot: new KnowledgeElementCollection([ke1, ke2, ke3]).toSnapshot(),
            });

            ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'].forEach((skillId) => {
              databaseBuilder.factory.buildCampaignSkill({
                campaignId: campaign.id,
                skillId: skillId,
              });
            });

            await databaseBuilder.commit();
          });

          it('should return the complete line', async function () {
            // given
            let csvSecondLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"'${campaign.name}";` +
              `"'${targetProfile.name}";` +
              `"'${organizationLearner.lastName}";` +
              `"'${organizationLearner.firstName}";` +
              `"${organizationLearner.attributes.hobby}";`;
            csvSecondLine += '1;';
            csvSecondLine +=
              `"${createdAtFormated}";` +
              '"Oui";' +
              `"${sharedAtFormated}";` +
              '0;' +
              '"Non";' +
              '0,67;' +
              '0,67;' +
              '3;' +
              '2;' +
              '0,67;' +
              '3;' +
              '2;' +
              '"OK";' +
              '"OK";' +
              '"KO"';

            // when
            await usecases.startWritingCampaignAssessmentResultsToStream({
              campaignId: campaign.id,
              writableStream,
              i18n,
            });

            const csv = await text(writableStream);
            const csvLines = csv.split('\n');
            const csvFirstLineCells = csvLines[0].split(';');

            // then
            expect(csvFirstLineCells[7]).to.equal('"hobby"');
            expect(csvLines[1]).to.equal(csvSecondLine);
          });
        });

        context('participation shared', function () {
          beforeEach(async function () {
            // learner
            participant = databaseBuilder.factory.buildUser();
            organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              firstName: '@Jean',
              lastName: '=Bono',
              organizationId: organization.id,
              userId: participant.id,
            });

            campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              organizationLearnerId: organizationLearner.id,
              userId: participant.id,
              masteryRate: 1,
              validatedSkillsCount: 3,
              createdAt,
              sharedAt,
            });

            databaseBuilder.factory.buildStageAcquisition({
              stageId: stageIds[0],
              campaignParticipationId: campaignParticipation.id,
            });
            databaseBuilder.factory.buildStageAcquisition({
              stageId: stageIds[1],
              campaignParticipationId: campaignParticipation.id,
            });

            databaseBuilder.factory.buildAssessment({
              campaignParticipationId: campaignParticipation.id,
              userId: participant.id,
              state: Assessment.states.COMPLETED,
              type: Assessment.types.CAMPAIGN,
            });

            const ke1 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb1',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke2 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb2',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke3 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb3',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            databaseBuilder.factory.buildKnowledgeElementSnapshot({
              campaignParticipationId: campaignParticipation.id,
              snapshot: new KnowledgeElementCollection([ke1, ke2, ke3]).toSnapshot(),
            });

            ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'].forEach((skillId) => {
              databaseBuilder.factory.buildCampaignSkill({
                campaignId: campaign.id,
                skillId: skillId,
              });
            });

            const badge1 = databaseBuilder.factory.buildBadge({
              title: 'Mon super badge',
              targetProfileId: targetProfile.id,
            });
            databaseBuilder.factory.buildBadge({
              title: 'Mon autre super badge',
              targetProfileId: targetProfile.id,
            });

            databaseBuilder.factory.buildBadgeAcquisition({
              badgeId: badge1.id,
              userId: participant.id,
              campaignParticipationId: campaignParticipation.id,
            });

            await databaseBuilder.commit();
          });

          it('should return the complete line', async function () {
            // given
            const expectedCsvFirstCell = '"Nom de l\'organisation"';
            let csvSecondLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"'${campaign.name}";` +
              `"'${targetProfile.name}";` +
              `"'${organizationLearner.lastName}";` +
              `"'${organizationLearner.firstName}";`;
            csvSecondLine += '1;';
            csvSecondLine +=
              `"${createdAtFormated}";` +
              '"Oui";' +
              `"${sharedAtFormated}";` +
              '1;' +
              '"Non";' +
              '"Oui";' +
              '"Non";' +
              '1;' +
              '1;' +
              '3;' +
              '3;' +
              '1;' +
              '3;' +
              '3;' +
              '"OK";' +
              '"OK";' +
              '"OK"';

            // when
            await usecases.startWritingCampaignAssessmentResultsToStream({
              campaignId: campaign.id,
              writableStream,
              i18n,
            });

            const csv = await text(writableStream);
            const csvLines = csv.split('\n');
            const csvFirstLineCells = csvLines[0].split(';');

            // then
            expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
            expect(csvLines[1]).to.equal(csvSecondLine);
          });
        });

        context('participation started', function () {
          beforeEach(async function () {
            ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'].forEach((skillId) => {
              databaseBuilder.factory.buildCampaignSkill({
                campaignId: campaign.id,
                skillId: skillId,
              });
            });
            // learner
            participant = databaseBuilder.factory.buildUser();
            organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              firstName: '@Jean',
              lastName: '=Bono',
              organizationId: organization.id,
              userId: participant.id,
            });

            campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              organizationLearnerId: organizationLearner.id,
              userId: participant.id,
              status: CampaignParticipationStatuses.STARTED,
              createdAt,
            });

            databaseBuilder.factory.buildAssessment({
              campaignParticipationId: campaignParticipation.id,
              userId: participant.id,
              state: Assessment.states.STARTED,
              type: Assessment.types.CAMPAIGN,
              createdAt,
            });

            databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb1',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });

            // anonymized learner
            const anonymizedOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              firstName: 'Anonymized',
              lastName: 'Anonymized',
              organizationId: organization.id,
              userId: null,
            });

            const anonymizedUser = databaseBuilder.factory.buildUser.anonymous();
            const anonymizedCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              organizationLearnerId: anonymizedOrganizationLearner.id,
              userId: null,
              status: CampaignParticipationStatuses.STARTED,
              createdAt: new Date('2018-01-01'),
            });

            databaseBuilder.factory.buildAssessment({
              campaignParticipationId: anonymizedCampaignParticipation.id,
              userId: anonymizedUser.id,
              state: Assessment.states.STARTED,
              type: Assessment.types.CAMPAIGN,
              createdAt: new Date('2018-01-01'),
            });

            if (type === 'EXAM') {
              const ke = domainBuilder.buildKnowledgeElement({
                status: 'validated',
                skillId: 'recSkillWeb1',
                competenceId: 'recCompetence1',
                userId: anonymizedUser.id,
                createdAt: new Date('2018-01-01'),
              });
              databaseBuilder.factory.buildKnowledgeElementSnapshot({
                campaignParticipationId: campaignParticipation.id,
                snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
              });
            } else {
              databaseBuilder.factory.buildKnowledgeElement({
                status: 'validated',
                skillId: 'recSkillWeb1',
                competenceId: 'recCompetence1',
                userId: anonymizedUser.id,
                createdAt: new Date('2018-01-01'),
              });
            }

            await databaseBuilder.commit();
          });

          it('should return a csv line with progression', async function () {
            // given
            const expectedCsvFirstCell = '"Nom de l\'organisation"';

            let csvSecondLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"'${campaign.name}";` +
              `"'${targetProfile.name}";` +
              `"'${organizationLearner.lastName}";` +
              `"'${organizationLearner.firstName}";`;
            csvSecondLine += '0,333;';
            csvSecondLine +=
              `"${createdAtFormated}";` +
              '"Non";' +
              `"NA";` +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA"';

            let csvThirdLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"'${campaign.name}";` +
              `"'${targetProfile.name}";` +
              `"Anonymized";` +
              `"Anonymized";`;
            csvThirdLine += '0;';
            csvThirdLine +=
              `"01/01/2018 01:00";` +
              '"Non";' +
              `"NA";` +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA"';

            // when
            await usecases.startWritingCampaignAssessmentResultsToStream({
              campaignId: campaign.id,
              writableStream,
              i18n,
            });

            const csv = await text(writableStream);
            const csvLines = csv.split('\n');
            const csvFirstLineCells = csvLines[0].split(';');

            // then
            expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
            expect(csvLines[1]).to.equal(csvSecondLine);
            expect(csvLines[2]).to.equal(csvThirdLine);
          });
        });

        context('multiple participations', function () {
          let secondCampaignParticipation, secondParticipationDateCreatedAt, secondParticipationCreatedFormated;

          beforeEach(async function () {
            secondParticipationDateCreatedAt = new Date('2019-03-05T11:23:00Z');
            secondParticipationCreatedFormated = '05/03/2019 12:23';
            // on utilise un nouveau learner
            participant = databaseBuilder.factory.buildUser();

            organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              firstName: '@Jean',
              lastName: '=Bono',
              organizationId: organization.id,
              userId: participant.id,
            });

            campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              organizationLearnerId: organizationLearner.id,
              userId: participant.id,
              isImproved: true,
              masteryRate: 0.67,
              createdAt,
              sharedAt,
            });

            databaseBuilder.factory.buildStageAcquisition({
              stageId: stageIds[0],
              campaignParticipationId: campaignParticipation.id,
            });

            databaseBuilder.factory.buildAssessment({
              campaignParticipationId: campaignParticipation.id,
              userId: participant.id,
              state: Assessment.states.COMPLETED,
              type: Assessment.types.CAMPAIGN,
            });

            // second participation
            secondCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
              status: CampaignParticipationStatuses.STARTED,
              campaignId: campaign.id,
              organizationLearnerId: organizationLearner.id,
              userId: participant.id,
              isImproved: false,
              createdAt: secondParticipationDateCreatedAt,
            });

            databaseBuilder.factory.buildAssessment({
              campaignParticipationId: secondCampaignParticipation.id,
              userId: participant.id,
              state: Assessment.states.STARTED,
              type: Assessment.types.CAMPAIGN,
            });

            const ke1 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb1',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke2 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'invalidated',
              skillId: 'recSkillWeb2',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });
            const ke3 = databaseBuilder.factory.buildKnowledgeElement({
              status: 'validated',
              skillId: 'recSkillWeb3',
              competenceId: 'recCompetence1',
              userId: participant.id,
              createdAt,
            });

            if (type === 'EXAM') {
              databaseBuilder.factory.buildKnowledgeElementSnapshot({
                campaignParticipationId: secondCampaignParticipation.id,
                snapshot: new KnowledgeElementCollection([
                  domainBuilder.buildKnowledgeElement({
                    status: 'validated',
                    skillId: 'recSkillWeb1',
                    competenceId: 'recCompetence1',
                    createdAt: new Date('2018-01-01'),
                  }),
                  domainBuilder.buildKnowledgeElement({
                    status: 'validated',
                    skillId: 'recSkillWeb3',
                    competenceId: 'recCompetence1',
                    createdAt: new Date('2018-01-01'),
                  }),
                ]).toSnapshot(),
              });
            } else {
              databaseBuilder.factory.buildKnowledgeElement({
                status: KnowledgeElement.StatusType.RESET,
                skillId: 'recSkillWeb2',
                competenceId: 'recCompetence1',
                userId: participant.id,
                createdAt: secondParticipationDateCreatedAt,
              });
            }

            databaseBuilder.factory.buildKnowledgeElementSnapshot({
              campaignParticipationId: campaignParticipation.id,
              snapshot: new KnowledgeElementCollection([ke1, ke2, ke3]).toSnapshot(),
            });

            ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'].forEach((skillId) => {
              databaseBuilder.factory.buildCampaignSkill({
                campaignId: campaign.id,
                skillId: skillId,
              });
            });
            await databaseBuilder.commit();
          });

          it('should return 2 lines', async function () {
            // given
            const expectedCsvFirstCell = '"Nom de l\'organisation"';

            let csvSecondLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"'${campaign.name}";` +
              `"'${targetProfile.name}";` +
              `"'${organizationLearner.lastName}";` +
              `"'${organizationLearner.firstName}";`;
            csvSecondLine += '0,667;';
            csvSecondLine +=
              `"${secondParticipationCreatedFormated}";` +
              '"Non";' +
              `"NA";` +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA"';

            let csvThirdLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"'${campaign.name}";` +
              `"'${targetProfile.name}";` +
              `"'${organizationLearner.lastName}";` +
              `"'${organizationLearner.firstName}";`;
            csvThirdLine += '1;';
            csvThirdLine +=
              `"${createdAtFormated}";` +
              '"Oui";' +
              `"${sharedAtFormated}";` +
              '0;' +
              '"Non";' +
              '0,67;' +
              '0,67;' +
              '3;' +
              '2;' +
              '0,67;' +
              '3;' +
              '2;' +
              '"OK";' +
              '"KO";' +
              '"OK"';
            // when
            await usecases.startWritingCampaignAssessmentResultsToStream({
              campaignId: campaign.id,
              writableStream,
              i18n,
            });

            const csv = await text(writableStream);
            const csvLines = csv.split('\n');
            const csvFirstLineCells = csvLines[0].split(';');

            // then
            expect(csvLines).to.have.lengthOf(4);
            expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
            expect(csvLines[1]).to.equals(csvSecondLine);
            expect(csvLines[2]).to.equal(csvThirdLine);
          });
        });
      });
    });
  });
});
