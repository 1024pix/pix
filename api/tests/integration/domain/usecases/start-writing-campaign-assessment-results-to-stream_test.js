const { PassThrough } = require('stream');
const { expect, mockLearningContent, databaseBuilder, domainBuilder, streamToPromise } = require('../../../test-helper');

const startWritingCampaignAssessmentResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-assessment-results-to-stream');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationInfoRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-info-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const targetProfileWithLearningContentRepository = require('../../../../lib/infrastructure/repositories/target-profile-with-learning-content-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const campaignCsvExportService = require('../../../../lib/domain/services/campaign-csv-export-service');

const Assessment = require('../../../../lib/domain/models/Assessment');
const { getI18n } = require('../../../tooling/i18n/i18n');

describe('Integration | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', () => {

  describe('#startWritingCampaignAssessmentResultsToStream', () => {

    let organization;
    let targetProfile;
    let user;
    let participant;
    let campaign;
    let campaignParticipation;
    let writableStream;
    let csvPromise;

    const i18n = getI18n();

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id });
      const skillWeb1 = domainBuilder.buildTargetedSkill({ id: 'recSkillWeb1', name: '@web1', tubeId: 'recTube1' });
      const skillWeb2 = domainBuilder.buildTargetedSkill({ id: 'recSkillWeb2', name: '@web2', tubeId: 'recTube1' });
      const skillWeb3 = domainBuilder.buildTargetedSkill({ id: 'recSkillWeb3', name: '@web3', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skillWeb1, skillWeb2, skillWeb3], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', index: '1.1', tubes: [tube1], areaId: 'recArea1' });
      domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1] });

      participant = databaseBuilder.factory.buildUser({ firstName: '@Jean', lastName: '=Bono' });
      const createdAt = new Date('2019-02-25T10:00:00Z');
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        skillId: skillWeb1.id,
        competenceId: competence1.id,
        userId: participant.id,
        createdAt,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        skillId: skillWeb2.id,
        competenceId: competence1.id,
        userId: participant.id,
        createdAt,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'invalidated',
        skillId: skillWeb3.id,
        competenceId: competence1.id,
        userId: participant.id,
        createdAt,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        skillId: skillWeb3.id,
        competenceId: competence1.id,
        userId: participant.id,
        createdAt: new Date('2019-03-25T10:00:00Z'),
      });

      targetProfile = databaseBuilder.factory.buildTargetProfile({ name: '+Profile 1' });
      [skillWeb1, skillWeb2, skillWeb3].map((skill) => {
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill.id });
      });

      campaign = databaseBuilder.factory.buildCampaign({
        name: '@Campagne de Test N°1',
        code: 'AZERTY123',
        organizationId: organization.id,
        idPixLabel: 'Mail Pro',
        type: 'ASSESSMENT',
        targetProfileId: targetProfile.id,
      });

      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        createdAt,
        sharedAt: new Date('2019-03-01T23:04:05Z'),
        participantExternalId: '+Mon mail pro',
        campaignId: campaign.id,
        isShared: true,
        userId: participant.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        userId: participant.id,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 1 });
      databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });
      await databaseBuilder.commit();

      const learningContent = {
        areas: [{ id: 'recArea1', competenceIds: ['recCompetence1'] }],
        competences: [{
          id: 'recCompetence1',
          index: '1.1',
          skillIds: ['recSkillWeb1', 'recSkillWeb2', 'recSkillWeb3'],
          areaId: 'recArea1',
          origin: 'Pix',
        }],
        tubes: [{ id: 'recTube1', competenceId: 'recCompetence1' }],
        skills: [
          { id: 'recSkillWeb1', name: '@web1', tubeId: 'recTube1', status: 'actif', competenceId: 'recCompetence1' },
          { id: 'recSkillWeb2', name: '@web2', tubeId: 'recTube1', status: 'actif', competenceId: 'recCompetence1' },
          { id: 'recSkillWeb3', name: '@web3', tubeId: 'recTube1', status: 'actif', competenceId: 'recCompetence1' },
        ],
      };

      mockLearningContent(learningContent);

      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);
    });

    it('should return the complete line', async () => {
      // given
      const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';
      const csvSecondLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"'${campaign.name}";` +
        `"'${targetProfile.name}";` +
        `"'${participant.lastName}";` +
        `"'${participant.firstName}";` +
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
      startWritingCampaignAssessmentResultsToStream({
        userId: user.id,
        campaignId: campaign.id,
        writableStream,
        i18n,
        campaignRepository,
        userRepository,
        targetProfileWithLearningContentRepository,
        organizationRepository,
        campaignParticipationInfoRepository,
        knowledgeElementRepository,
        badgeAcquisitionRepository,
        campaignCsvExportService,
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
