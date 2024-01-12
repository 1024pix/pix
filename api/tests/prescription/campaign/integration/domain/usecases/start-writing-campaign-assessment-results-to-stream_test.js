import stream from 'stream';

const { PassThrough } = stream;

import { expect, mockLearningContent, databaseBuilder, streamToPromise } from '../../../../../test-helper.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Integration | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', function () {
  describe('#startWritingCampaignAssessmentResultsToStream', function () {
    let organization;
    let targetProfile;
    let user;
    let participant;
    let campaign;
    let campaignParticipation;
    let organizationLearner;
    let writableStream;
    let csvPromise;
    let i18n;

    beforeEach(async function () {
      i18n = getI18n();
      organization = databaseBuilder.factory.buildOrganization({ showSkills: true });
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id });

      participant = databaseBuilder.factory.buildUser();
      const createdAt = new Date('2019-02-25T10:00:00Z');
      const sharedAt = new Date('2019-03-01T23:04:05Z');
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

      targetProfile = databaseBuilder.factory.buildTargetProfile({ name: '+Profile 1' });

      campaign = databaseBuilder.factory.buildCampaign({
        name: '@Campagne de Test N°1',
        code: 'AZERTY123',
        organizationId: organization.id,
        idPixLabel: 'Mail Pro',
        type: 'ASSESSMENT',
        targetProfileId: targetProfile.id,
      });
      ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'].forEach((skillId) => {
        databaseBuilder.factory.buildCampaignSkill({
          campaignId: campaign.id,
          skillId: skillId,
        });
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
          masteryRate: 0.67,
        },
      );
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: participant.id,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 0 });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 1 });
      databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: participant.id,
        snappedAt: sharedAt,
        snapshot: JSON.stringify([ke1, ke2, ke3]),
      });

      await databaseBuilder.commit();

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
        `"'${campaignParticipation.participantExternalId}";` +
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
        userId: user.id,
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
});
