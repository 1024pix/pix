const { PassThrough } = require('stream');
const moment = require('moment');

const { expect, sinon, domainBuilder, streamToPromise } = require('../../../test-helper');

const startWritingCampaignResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-results-to-stream');
const Area = require('../../../../lib/domain/models/Area');

describe('Unit | Domain | Use Cases | start-writing-campaign-results-to-stream', () => {

  describe('#startWritingCampaignResultsToStream', () => {

    const user = domainBuilder.buildUser({ firstName: '@Jean', lastName: '=Bono' });
    const organization = user.memberships[0].organization;
    const listSkills = domainBuilder.buildSkillCollection({ name: '@web', minLevel: 1, maxLevel: 5 });
    listSkills.forEach((skill) => { skill.competenceId = 'recCompetence1'; });
    const listSkillsNotInTargetProfile = domainBuilder.buildSkillCollection({ name: '@url', minLevel: 1, maxLevel: 2 });
    const [skillWeb1, skillWeb2, skillWeb3, skillWeb4, skillWeb5] = listSkills;
    const [skillUrl1, skillUrl2] = listSkillsNotInTargetProfile;
    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb1.id,
        createdAt: moment().subtract(2, 'days').toDate()
      }),
      domainBuilder.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb2.id,
        createdAt: moment().subtract(2, 'days').toDate()
      }),
      domainBuilder.buildKnowledgeElement({
        status: 'validated',
        pixScore: 2,
        skillId: skillWeb3.id,
        createdAt: moment().subtract(2, 'days').toDate()
      }),
      domainBuilder.buildKnowledgeElement({
        status: 'invalidated',
        pixScore: 2,
        skillId: skillWeb4.id,
        createdAt: moment().subtract(2, 'days').toDate()
      }),
      domainBuilder.buildKnowledgeElement({
        status: 'invalidated',
        pixScore: 2,
        skillId: skillWeb5.id,
        createdAt: moment().subtract(2, 'days').toDate()
      }),
      domainBuilder.buildKnowledgeElement({
        status: 'validated',
        skillId: skillUrl1.id,
        createdAt: moment().subtract(2, 'days').toDate()
      }),
      domainBuilder.buildKnowledgeElement({
        status: 'validated',
        skillId: skillUrl2.id,
        createdAt: moment().subtract(2, 'days').toDate()
      }),

    ];

    const targetProfile = domainBuilder.buildTargetProfile({
      skills: listSkills, name: '+Profile 1'
    });

    const campaign = domainBuilder.buildCampaign({
      name:'@Campagne de Test N°1',
      code:'AZERTY123',
      organizationId: organization.id,
      idPixLabel: 'Mail Pro',
    });
    const competences = [
      {
        id: 'recCompetence1',
        name: 'Competence1',
        index: '1.1',
        skills: listSkills.map((skill) => skill.id),
        area: new Area({
          id: 'recArea1',
          code: '1',
          title: 'Domain 1',
        }),
      },
      {
        id: 'recCompetence2',
        name: 'Competence2',
        index: '3.2',
        skills: [],
        area: new Area({
          id: 'recArea3',
          code: '3',
          title: 'Domain 3',
        }),
      },
    ];

    const campaignRepository = { get: () => undefined };
    const userRepository = { getWithMemberships: () => undefined };
    const targetProfileRepository = { get: () => undefined };
    const competenceRepository = { list: () => undefined };
    const organizationRepository = { get: () => undefined };
    const campaignParticipationRepository = { findResultDataByCampaignId: () => undefined };
    const knowledgeElementRepository = { findUniqByUserId: () => undefined };

    let findResultDataByCampaignIdStub;
    let targetProfileRepositoryStub;
    let knowledgeElementRepositoryStub;

    let writableStream;
    let csvPromise;

    beforeEach(() => {

      sinon.stub(campaignRepository, 'get').resolves(campaign);
      sinon.stub(competenceRepository, 'list').resolves(competences);
      targetProfileRepositoryStub = sinon.stub(targetProfileRepository, 'get').resolves(targetProfile);
      sinon.stub(userRepository, 'getWithMemberships').resolves(user);
      sinon.stub(organizationRepository, 'get').resolves(organization);
      knowledgeElementRepositoryStub = sinon.stub(knowledgeElementRepository, 'findUniqByUserId').resolves(knowledgeElements);
      findResultDataByCampaignIdStub = sinon.stub(campaignParticipationRepository, 'findResultDataByCampaignId');

      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);
    });

    it('should return the header in CSV styles with all competence, domain and skills', async () => {
      // given
      const csvExpected = '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Profil Cible";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Mail Pro";' +
        '"% de progression";' +
        '"Date de début";' +
        '"Partage (O/N)";' +
        '"Date du partage";' +
        '"% maitrise de l\'ensemble des acquis du profil";' +
        '"% de maitrise des acquis de la compétence Competence1";' +
        '"Nombre d\'acquis du profil cible dans la compétence Competence1";' +
        '"Acquis maitrisés dans la compétence Competence1";' +
        '"% de maitrise des acquis du domaine Domain 1";' +
        '"Nombre d\'acquis du profil cible du domaine Domain 1";' +
        '"Acquis maitrisés du domaine Domain 1";' +
        '"\'@web1";' +
        '"\'@web2";' +
        '"\'@web3";' +
        '"\'@web4";' +
        '"\'@web5"\n';
      findResultDataByCampaignIdStub.resolves([]);

      // when
      startWritingCampaignResultsToStream({
        userId: user.id,
        campaignId: campaign.id,
        writableStream,
        campaignRepository,
        userRepository,
        targetProfileRepository,
        competenceRepository,
        organizationRepository,
        campaignParticipationRepository,
        knowledgeElementRepository,
      });

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(csvExpected);
    });

    context('when isShared is true', () => {

      it('should return the complete line with user results for her participation', async () => {
        // given
        const campaignParticipationResultData = {
          id: 1,
          isShared: true,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '+Mon mail pro',
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };
        findResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const csvSecondLine = `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"'${targetProfile.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
          `"'${campaignParticipationResultData.participantExternalId}";` +
          '1;' +
          '2019-02-25;' +
          '"Oui";' +
          '2019-03-01;' +
          '0,6;' +
          '0,6;' +
          '5;' +
          '3;' +
          '0,6;' +
          '5;' +
          '3;' +
          '"OK";' +
          '"OK";' +
          '"OK";' +
          '"KO";' +
          '"KO"';

        // when
        startWritingCampaignResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          knowledgeElementRepository,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });

    context('when isShared is false', () => {

      it('should return the beginning of the line with user information for her participation', async () => {
        // given

        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '-Mon mail pro',
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };

        findResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"'${targetProfile.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
          `"'${campaignParticipationResultData.participantExternalId}";` +
          '1;' +
          '2019-02-25;' +
          '"Non";' +
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
          '"NA";' +
          '"NA"';

        // when
        startWritingCampaignResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          knowledgeElementRepository,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });

    context('when the campaign participation result is completed', () => {
      it('should return a percentage of progression of 1', async () => {
        // given

        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '-Mon mail pro',
          isCompleted: true,
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };

        findResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);
        knowledgeElementRepositoryStub.resolves([]);

        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"'${targetProfile.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
          `"'${campaignParticipationResultData.participantExternalId}";` +
          '1;' +
          '2019-02-25;' +
          '"Non";' +
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
          '"NA";' +
          '"NA"';

        // when
        startWritingCampaignResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          knowledgeElementRepository,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });

    context('when the campaign participation result is not completed', () => {
      const skillList = [
        domainBuilder.buildSkill({ competenceId: 'recCompetence1' }),
        domainBuilder.buildSkill({ competenceId: 'recCompetence1' })
      ];

      const targetProfile = domainBuilder.buildTargetProfile({
        skills: skillList
      });

      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ skillId: skillList[0].id }),
      ];

      beforeEach(() => {
        targetProfileRepositoryStub.resolves(targetProfile);
        knowledgeElementRepositoryStub.resolves(knowledgeElements);
      });

      it('should return a percentage of knowledge element evaluated divided by the number of skill in the target profile', async () => {
        // given

        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '-Mon mail pro',
          userId: 123,
          isCompleted: false,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };

        findResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"${targetProfile.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
          `"'${campaignParticipationResultData.participantExternalId}";` +
          '0,5;' +
          '2019-02-25;' +
          '"Non";' +
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
        startWritingCampaignResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          knowledgeElementRepository,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });

    context('when campaign do not have a idPixLabel', () => {

      beforeEach(() => {
        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };

        findResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const campaignWithoutIdPixLabel = domainBuilder.buildCampaign({
          name: 'CampaignName',
          code: 'AZERTY123',
          organizationId: organization.id,
          idPixLabel: null,
        });
        campaignRepository.get.resolves(campaignWithoutIdPixLabel);
      });

      it('should return the header in CSV styles with all competence, domain and skills', async () => {
        // given
        const csvExpected = '\uFEFF"Nom de l\'organisation";' +
          '"ID Campagne";' +
          '"Nom de la campagne";' +
          '"Nom du Profil Cible";' +
          '"Nom du Participant";' +
          '"Prénom du Participant";' +
          '"% de progression";' +
          '"Date de début";' +
          '"Partage (O/N)";' +
          '"Date du partage";' +
          '"% maitrise de l\'ensemble des acquis du profil";' +
          '"% de maitrise des acquis de la compétence Competence1";' +
          '"Nombre d\'acquis du profil cible dans la compétence Competence1";' +
          '"Acquis maitrisés dans la compétence Competence1";' +
          '"% de maitrise des acquis du domaine Domain 1";' +
          '"Nombre d\'acquis du profil cible du domaine Domain 1";' +
          '"Acquis maitrisés du domaine Domain 1";' +
          '"\'@web1";' +
          '"\'@web2";' +
          '"\'@web3";' +
          '"\'@web4";' +
          '"\'@web5"';

        // when
        startWritingCampaignResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          knowledgeElementRepository,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[0]).to.equal(csvExpected);
      });
    });
  });
});
