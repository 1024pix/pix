const { PassThrough } = require('stream');
const { expect, airtableBuilder, databaseBuilder, streamToPromise } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

const startWritingCampaignProfilesCollectionResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-profiles-collection-results-to-stream');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userService = require('../../../../lib/domain/services/user-service');

describe('Integration | Domain | Use Cases | start-writing-profiles-collection-campaign-results-to-stream', () => {

  describe('#startWritingCampaignProfilesCollectionResultsToStream', () => {

    let organization;
    let user;
    let participant;
    let campaign;
    let campaignParticipation;
    let writableStream;
    let csvPromise;

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id });
      const skillWeb1 = airtableBuilder.factory.buildSkill({ id: 'recSkillWeb1', nom: '@web1', ['compétenceViaTube']: ['recCompetence1'] });
      const skillWeb2 = airtableBuilder.factory.buildSkill({ id: 'recSkillWeb2', nom: '@web2', ['compétenceViaTube']: ['recCompetence1'] });
      const skillWeb3 = airtableBuilder.factory.buildSkill({ id: 'recSkillWeb3', nom: '@web3', ['compétenceViaTube']: ['recCompetence1'] });
      const skillUrl1 = airtableBuilder.factory.buildSkill({ id: 'recSkillUrl1', nom: '@url1', ['compétenceViaTube']: ['recCompetence2'] });
      const skillUrl8 = airtableBuilder.factory.buildSkill({ id: 'recSkillUrl8', nom: '@url8', ['compétenceViaTube']: ['recCompetence2'] });
      const skills = [skillWeb1, skillWeb2, skillWeb3, skillUrl1, skillUrl8];

      participant = databaseBuilder.factory.buildUser({ firstName: '@Jean', lastName: '=Bono' });
      const createdAt = new Date('2019-02-25T10:00:00Z');
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb1.id,
        earnedPix: 6,
        competenceId: 'recCompetence1',
        userId: participant.id,
        createdAt,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb2.id,
        earnedPix: 6,
        competenceId: 'recCompetence1',
        userId: participant.id,
        createdAt,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'invalidated',
        pixScore: 2,
        skillId: skillWeb3.id,
        earnedPix: 0,
        competenceId: 'recCompetence1',
        userId: participant.id,
        createdAt,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb3.id,
        earnedPix: 6,
        competenceId: 'recCompetence1',
        userId: participant.id,
        createdAt: new Date('2019-03-25T10:00:00Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        skillId: skillUrl1.id,
        earnedPix: 2,
        competenceId: 'recCompetence2',
        userId: participant.id,
        createdAt,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        skillId: skillUrl8.id,
        earnedPix: 64,
        competenceId: 'recCompetence2',
        userId: participant.id,
        createdAt,
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
        sharedAt: new Date('2019-03-01T23:04:05Z'),
        participantExternalId: '+Mon mail pro',
        campaignId: campaign.id,
        isShared: true,
        userId: participant.id,
      });

      await databaseBuilder.commit();

      const competence1 = airtableBuilder.factory.buildCompetence({
        id: 'recCompetence1',
        titre: 'Competence1',
        sousDomaine: '1.1',
        domaineIds: ['recArea1'],
        acquisViaTubes: [skillWeb1, skillWeb2, skillWeb3].map((skill) => skill.id),
      });

      const competence2 = airtableBuilder.factory.buildCompetence({
        id: 'recCompetence2',
        titre: 'Competence2',
        sousDomaine: '3.2',
        domaineIds: ['recArea3'],
        acquisViaTubes: [skillUrl1.id, skillUrl8.id],
      });

      const area1 = airtableBuilder.factory.buildArea({ id: 'recArea1', code: '1', titre: 'Domain 1' });
      const area3 = airtableBuilder.factory.buildArea({ id: 'recArea3', code: '3', title: 'Domain 3' });

      airtableBuilder.mockList({ tableName: 'Competences' }).returns([competence1, competence2]).activate();
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns(skills).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([area1, area3]).activate();

      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return the complete line', async () => {
      // given
      const expectedCsvFirstCell = '\uFEFF"Nom de l\'organisation"';
      const expectedCsvSecondLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"'${campaign.name}";` +
        `"'${participant.lastName}";` +
        `"'${participant.firstName}";` +
        `"'${campaignParticipation.participantExternalId}";` +
        '"Oui";' +
        '2019-03-01;' +
        '52;' +
        '"Non";' +
        '2;' +
        '1;' +
        '12;' +
        '5;' +
        '40';

      // when
      startWritingCampaignProfilesCollectionResultsToStream({
        userId: user.id,
        campaignId: campaign.id,
        writableStream,
        campaignRepository,
        userRepository,
        competenceRepository,
        organizationRepository,
        campaignParticipationRepository,
        userService,
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
