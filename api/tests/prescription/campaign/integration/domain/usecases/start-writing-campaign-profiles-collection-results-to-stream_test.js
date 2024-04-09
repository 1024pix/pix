import stream from 'node:stream';

const { PassThrough } = stream;

import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../../../lib/domain/constants.js';
import * as placementProfileService from '../../../../../../lib/domain/services/placement-profile-service.js';
import * as campaignRepository from '../../../../../../lib/infrastructure/repositories/campaign-repository.js';
import { startWritingCampaignProfilesCollectionResultsToStream } from '../../../../../../src/prescription/campaign/domain/usecases/start-writing-campaign-profiles-collection-results-to-stream.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-participation-repository.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import * as competenceRepository from '../../../../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as organizationRepository from '../../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import * as userRepository from '../../../../../../src/shared/infrastructure/repositories/user-repository.js';
import { databaseBuilder, expect, mockLearningContent, streamToPromise } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Integration | Domain | Use Cases | start-writing-profiles-collection-campaign-results-to-stream', function () {
  describe('#startWritingCampaignProfilesCollectionResultsToStream', function () {
    let organization;
    let participant;
    let organizationLearner;
    let campaign;
    let campaignParticipation;
    let writableStream;
    let csvPromise;
    let i18n;

    const createdAt = new Date('2019-02-25T10:00:00Z');
    const sharedAt = new Date('2019-03-01T23:04:05Z');

    beforeEach(async function () {
      i18n = getI18n();
      organization = databaseBuilder.factory.buildOrganization();
      const skillWeb1 = { id: 'recSkillWeb1', name: '@web1', competenceIds: ['recCompetence1'] };
      const skillWeb2 = { id: 'recSkillWeb2', name: '@web2', competenceIds: ['recCompetence1'] };
      const skillWeb3 = { id: 'recSkillWeb3', name: '@web3', competenceIds: ['recCompetence1'] };
      const skillUrl1 = { id: 'recSkillUrl1', name: '@url1', competenceIds: ['recCompetence2'] };
      const skillUrl8 = { id: 'recSkillUrl8', name: '@url8', competenceIds: ['recCompetence2'] };
      const skills = [skillWeb1, skillWeb2, skillWeb3, skillUrl1, skillUrl8];

      participant = databaseBuilder.factory.buildUser();

      const ke1 = databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb1.id,
        earnedPix: 6,
        competenceId: 'recCompetence1',
        userId: participant.id,
        createdAt,
      });
      const ke2 = databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb2.id,
        earnedPix: 6,
        competenceId: 'recCompetence1',
        userId: participant.id,
        createdAt,
      });
      const ke3 = databaseBuilder.factory.buildKnowledgeElement({
        status: 'invalidated',
        pixScore: 2,
        skillId: skillWeb3.id,
        earnedPix: 0,
        competenceId: 'recCompetence1',
        userId: participant.id,
        createdAt,
      });
      const ke4 = databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        skillId: skillUrl1.id,
        earnedPix: 2,
        competenceId: 'recCompetence2',
        userId: participant.id,
        createdAt,
      });
      const ke5 = databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        skillId: skillUrl8.id,
        earnedPix: 64,
        competenceId: 'recCompetence2',
        userId: participant.id,
        createdAt,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: participant.id,
        snappedAt: sharedAt,
        snapshot: JSON.stringify([ke1, ke2, ke3, ke4, ke5]),
      });

      await databaseBuilder.commit();

      const learningContent = {
        areas: [{ id: 'recArea1' }, { id: 'recArea2' }],
        competences: [
          {
            id: 'recCompetence1',
            areaId: 'recArea1',
            skillIds: [skillWeb1.id, skillWeb2.id, skillWeb3.id],
            origin: 'Pix',
          },
          {
            id: 'recCompetence2',
            areaId: 'recArea2',
            skillIds: [skillUrl1.id, skillUrl8.id],
            origin: 'Pix',
          },
        ],
        skills,
      };
      mockLearningContent(learningContent);

      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);
    });

    context('common cases', function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'PRO' });

        campaign = databaseBuilder.factory.buildCampaign({
          name: '@Campagne de Test N°2',
          code: 'QWERTY456',
          organizationId: organization.id,
          idPixLabel: 'Mail Perso',
          targetProfileId: null,
          type: 'PROFILES_COLLECTION',
          title: null,
        });

        organizationLearner = { firstName: '@Jean', lastName: '=Bono' };
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          organizationLearner,
          {
            createdAt,
            sharedAt,
            status: CampaignParticipationStatuses.SHARED,
            participantExternalId: '+Mon mail pro',
            campaignId: campaign.id,
            userId: participant.id,
            pixScore: 52,
            isImproved: true,
          },
        );

        campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          organizationLearner,
          {
            createdAt,
            sharedAt: null,
            status: CampaignParticipationStatuses.TO_SHARE,
            participantExternalId: '+Mon mail pro',
            campaignId: campaign.id,
            userId: participant.id,
            pixScore: 0,
            isImproved: false,
          },
        );

        await databaseBuilder.commit();
      });

      it('should return all participation for one learner', async function () {
        startWritingCampaignProfilesCollectionResultsToStream({
          campaignId: campaign.id,
          writableStream,
          i18n,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const cells = csv.split('\n');

        expect(cells[0]).to.be.equals(
          '\uFEFF"Nom de l\'organisation";"ID Campagne";"Code";"Nom de la campagne";"Nom du Participant";"Prénom du Participant";"Mail Perso";"Envoi (O/N)";"Date de l\'envoi";"Nombre de pix total";"Certifiable (O/N)";"Nombre de compétences certifiables";"Niveau pour la compétence ";"Nombre de pix pour la compétence ";"Niveau pour la compétence ";"Nombre de pix pour la compétence "',
        );
        expect(cells[1]).to.be.equals(
          `"Observatoire de Pix";${campaign.id};"QWERTY456";"'@Campagne de Test N°2";"'=Bono";"'@Jean";"'+Mon mail pro";"Oui";2019-03-01;52;"Non";2;1;12;5;40`,
        );
        expect(cells[2]).to.be.equals(
          `"Observatoire de Pix";${campaign.id};"QWERTY456";"'@Campagne de Test N°2";"'=Bono";"'@Jean";"'+Mon mail pro";"Non";"NA";"NA";"NA";"NA";"NA";"NA";"NA";"NA"`,
        );
      });
    });

    context('When the organization is PRO', function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'PRO' });

        campaign = databaseBuilder.factory.buildCampaign({
          name: '@Campagne de Test N°2',
          code: 'QWERTY456',
          organizationId: organization.id,
          idPixLabel: 'Mail Perso',
          targetProfileId: null,
          type: 'PROFILES_COLLECTION',
          title: null,
        });

        organizationLearner = { firstName: '@Jean', lastName: '=Bono' };
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          organizationLearner,
          {
            createdAt,
            sharedAt,
            participantExternalId: '+Mon mail pro',
            campaignId: campaign.id,
            userId: participant.id,
            pixScore: 52,
          },
        );

        await databaseBuilder.commit();
      });

      it('should return the complete line', async function () {
        // given
        const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';
        const expectedCsvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"'${campaign.name}";` +
          `"'${organizationLearner.lastName}";` +
          `"'${organizationLearner.firstName}";` +
          `"'${campaignParticipation.participantExternalId}";` +
          '"Oui";' +
          '2019-03-01;' +
          '52;' +
          '"Non";' +
          '2;' +
          '1;' +
          '12;' +
          `${MAX_REACHABLE_LEVEL};` +
          `${MAX_REACHABLE_PIX_BY_COMPETENCE}`;

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          campaignId: campaign.id,
          writableStream,
          i18n,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');
        const csvFirstLineCells = csvLines[0].split(';');

        // then
        expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
        expect(csvLines[1]).to.equal(expectedCsvSecondLine);
      });
    });

    context('When the organization is SCO and managing student', function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          userId: participant.id,
          firstName: '@Jean',
          lastName: '=Bono',
          division: '3emeG',
          organizationId: organization.id,
        });

        campaign = databaseBuilder.factory.buildCampaign({
          name: '@Campagne de Test N°2',
          code: 'QWERTY456',
          organizationId: organization.id,
          idPixLabel: 'Mail Perso',
          targetProfileId: null,
          type: 'PROFILES_COLLECTION',
          title: null,
        });

        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          createdAt,
          sharedAt,
          participantExternalId: '+Mon mail pro',
          campaignId: campaign.id,
          userId: participant.id,
          organizationLearnerId: organizationLearner.id,
          pixScore: 52,
        });

        await databaseBuilder.commit();
      });

      it('should return the complete line', async function () {
        // given
        const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';
        const expectedCsvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"'${campaign.name}";` +
          `"'${organizationLearner.lastName}";` +
          `"'${organizationLearner.firstName}";` +
          `"${organizationLearner.division}";` +
          `"'${campaignParticipation.participantExternalId}";` +
          '"Oui";' +
          '2019-03-01;' +
          '52;' +
          '"Non";' +
          '2;' +
          '1;' +
          '12;' +
          `${MAX_REACHABLE_LEVEL};` +
          `${MAX_REACHABLE_PIX_BY_COMPETENCE}`;

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          campaignId: campaign.id,
          writableStream,
          i18n,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');
        const csvFirstLineCells = csvLines[0].split(';');

        // then
        expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
        expect(csvLines[1]).to.equal(expectedCsvSecondLine);
      });
    });

    context('When the organization is SUP and isManagingStudent', function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          userId: participant.id,
          studentNumber: '12345A',
          firstName: '@Jean',
          lastName: '=Bono',
          group: '=AB1',
          organizationId: organization.id,
        });

        campaign = databaseBuilder.factory.buildCampaign({
          name: '@Campagne de Test N°2',
          code: 'QWERTY456',
          organizationId: organization.id,
          idPixLabel: 'Mail Perso',
          targetProfileId: null,
          type: 'PROFILES_COLLECTION',
          title: null,
        });

        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          createdAt,
          sharedAt,
          participantExternalId: '+Mon mail pro',
          campaignId: campaign.id,
          userId: participant.id,
          organizationLearnerId: organizationLearner.id,
          pixScore: 52,
        });

        await databaseBuilder.commit();
      });

      it('should return the complete line for a SUP organisation that manages students', async function () {
        // given
        const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';
        const expectedCsvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"'${campaign.name}";` +
          `"'${organizationLearner.lastName}";` +
          `"'${organizationLearner.firstName}";` +
          `"'${organizationLearner.group}";` +
          `"${organizationLearner.studentNumber}";` +
          `"'${campaignParticipation.participantExternalId}";` +
          '"Oui";' +
          '2019-03-01;' +
          '52;' +
          '"Non";' +
          '2;' +
          '1;' +
          '12;' +
          `${MAX_REACHABLE_LEVEL};` +
          `${MAX_REACHABLE_PIX_BY_COMPETENCE}`;

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          campaignId: campaign.id,
          writableStream,
          i18n,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');
        const csvFirstLineCells = csvLines[0].split(';');

        // then
        expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
        expect(csvLines[1]).to.equal(expectedCsvSecondLine);
      });
    });
  });
});
