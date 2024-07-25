import stream from 'node:stream';

const { PassThrough } = stream;

import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { CampaignParticipationStatuses, KnowledgeElement } from '../../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, expect, mockLearningContent, streamToPromise } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Integration | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', function () {
  describe('#startWritingCampaignAssessmentResultsToStream', function () {
    let organization;
    let targetProfile;
    let participant;
    let campaign;
    let campaignParticipation;
    let organizationLearner;
    let writableStream;
    let csvPromise;
    let i18n;
    let createdAt, sharedAt;

    beforeEach(async function () {
      i18n = getI18n();
      organization = databaseBuilder.factory.buildOrganization({ showSkills: true });

      // Profil cible
      targetProfile = databaseBuilder.factory.buildTargetProfile({ name: '+Profile 1' });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 0 });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 1 });
      databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });

      // campagne
      campaign = databaseBuilder.factory.buildCampaign({
        name: '@Campagne de Test N°1',
        code: 'AZERTY123',
        organizationId: organization.id,
        idPixLabel: 'Mail Pro',
        type: 'ASSESSMENT',
        targetProfileId: targetProfile.id,
      });

      // participation
      createdAt = new Date('2019-02-25');
      sharedAt = new Date('2019-03-01');

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
      mockLearningContent(learningContent);

      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);
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
          participantExternalId: 'toto',
          masteryRate: 0.67,
          createdAt,
          sharedAt,
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
          userId: participant.id,
          snappedAt: sharedAt,
          snapshot: JSON.stringify([ke1, ke2, ke3]),
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
        const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';
        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"'${campaign.name}";` +
          `"'${targetProfile.name}";` +
          `"'${organizationLearner.lastName}";` +
          `"'${organizationLearner.firstName}";` +
          `"${campaignParticipation.participantExternalId}";` +
          '1;' +
          '2019-02-25;' +
          '"Oui";' +
          '2019-03-01;' +
          '1;' +
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
        const csv = await csvPromise;

        const csvLines = csv.split('\n');
        const csvFirstLineCells = csvLines[0].split(';');

        // then
        expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });

    context('participation started', function () {
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
          participantExternalId: 'toto',
          status: CampaignParticipationStatuses.STARTED,
          createdAt,
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId: participant.id,
          state: Assessment.states.STARTED,
          type: Assessment.types.CAMPAIGN,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          status: 'validated',
          skillId: 'recSkillWeb1',
          competenceId: 'recCompetence1',
          userId: participant.id,
        });

        ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'].forEach((skillId) => {
          databaseBuilder.factory.buildCampaignSkill({
            campaignId: campaign.id,
            skillId: skillId,
          });
        });

        await databaseBuilder.commit();
      });

      it('should return a csv line with progression', async function () {
        // given
        const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';
        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"'${campaign.name}";` +
          `"'${targetProfile.name}";` +
          `"'${organizationLearner.lastName}";` +
          `"'${organizationLearner.firstName}";` +
          `"${campaignParticipation.participantExternalId}";` +
          '0,333;' +
          `2019-02-25;` +
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

        const csv = await csvPromise;
        const csvLines = csv.split('\n');
        const csvFirstLineCells = csvLines[0].split(';');

        // then
        expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });

    context('multiple participations', function () {
      let secondParticipationDateCreatedAt;
      beforeEach(async function () {
        secondParticipationDateCreatedAt = new Date('2019-03-05');
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
          participantExternalId: 'toto',
          isImproved: true,
          masteryRate: 0.67,
          createdAt,
          sharedAt,
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId: participant.id,
          state: Assessment.states.COMPLETED,
          type: Assessment.types.CAMPAIGN,
        });

        // second participation
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          status: CampaignParticipationStatuses.STARTED,
          campaignId: campaign.id,
          organizationLearnerId: organizationLearner.id,
          userId: participant.id,
          participantExternalId: 'toto',
          isImproved: false,
          createdAt: secondParticipationDateCreatedAt,
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
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

        databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.RESET,
          skillId: 'recSkillWeb2',
          competenceId: 'recCompetence1',
          userId: participant.id,
          createdAt: secondParticipationDateCreatedAt,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          userId: participant.id,
          snappedAt: sharedAt,
          snapshot: JSON.stringify([ke1, ke2, ke3]),
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
        const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';

        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"'${campaign.name}";` +
          `"'${targetProfile.name}";` +
          `"'${organizationLearner.lastName}";` +
          `"'${organizationLearner.firstName}";` +
          `"${campaignParticipation.participantExternalId}";` +
          '0,667;' +
          `2019-03-05;` +
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

        const csvThirdLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"'${campaign.name}";` +
          `"'${targetProfile.name}";` +
          `"'${organizationLearner.lastName}";` +
          `"'${organizationLearner.firstName}";` +
          `"${campaignParticipation.participantExternalId}";` +
          '1;' +
          '2019-02-25;' +
          '"Oui";' +
          '2019-03-01;' +
          '1;' +
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

        const csv = await csvPromise;
        const csvLines = csv.split('\n');
        const csvFirstLineCells = csvLines[0].split(';');

        // then
        expect(csvLines.length).to.equals(4);
        expect(csvFirstLineCells[0]).to.equal(expectedCsvFirstCell);
        expect(csvLines[1]).to.equals(csvSecondLine);
        expect(csvLines[2]).to.equal(csvThirdLine);
      });
    });
  });
});
