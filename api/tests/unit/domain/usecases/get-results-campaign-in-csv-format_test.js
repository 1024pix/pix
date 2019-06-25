const { expect, sinon, domainBuilder } = require('../../../test-helper');
const moment = require('moment');

const getResultsCampaignInCsvFormat = require('../../../../lib/domain/usecases/get-results-campaign-in-csv-format');
const Area = require('../../../../lib/domain/models/Area');

describe('Unit | Domain | Use Cases | get-results-campaign-in-csv-format', () => {

  describe('#getResultsCampaignInCsvFormat', () => {

    const user = domainBuilder.buildUser();
    const organization = user.memberships[0].organization;
    const listSkills = domainBuilder.buildSkillCollection({ name: 'web', minLevel: 1, maxLevel: 5 });
    const listSkillsNotInTargetProfile = domainBuilder.buildSkillCollection({ name: 'url', minLevel: 1, maxLevel: 2 });
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

    const assessment = domainBuilder.buildAssessment.ofTypeSmartPlacement({
      state: 'completed',
      createdAt: new Date('2017-05-09T00:30:00Z'),
      knowledgeElements
    });

    const targetProfile = domainBuilder.buildTargetProfile({ skills: listSkills, name: 'Profile 1' });

    const campaign = domainBuilder.buildCampaign({
      name:'Campaign "Name"',
      code:'AZERTY123',
      organizationId: organization.id,
      idPixLabel: 'Mail Pro',
    });
    const competences = [
      {
        name: 'Competence1',
        index: '1.1',
        courseId: 'recComp1',
        skills: listSkills.map((skill) => skill.id),
        area: new Area({
          code: '1',
          title: 'Domain 1',
        }),
      },
      {
        name: 'Competence2',
        index: '3.2',
        courseId: 'recComp2',
        skills: [],
        area: new Area({
          code: '3',
          title: 'Domain 3',
        }),
      },
    ];
    const campaignRepository = { get: () => undefined };
    const userRepository = { getWithMemberships: () => undefined, get: () => undefined };
    const targetProfileRepository = { get: () => undefined };
    const competenceRepository = { list: () => undefined };
    const organizationRepository = { get: () => undefined };
    const campaignParticipationRepository = { findByCampaignIdUniqByUserId: () => undefined };
    const smartPlacementAssessmentRepository = { get: () => undefined };
    const knowledgeElementRepository = { findUniqByUserId: () => undefined };

    let findCampaignParticipationStub;

    beforeEach(() => {

      sinon.stub(campaignRepository, 'get').resolves(campaign);
      sinon.stub(competenceRepository, 'list').resolves(competences);
      sinon.stub(targetProfileRepository, 'get').resolves(targetProfile);
      sinon.stub(userRepository, 'getWithMemberships').resolves(user);
      sinon.stub(organizationRepository, 'get').resolves(organization);
      sinon.stub(userRepository, 'get').resolves(user);
      sinon.stub(smartPlacementAssessmentRepository, 'get').resolves(assessment);
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId').resolves(knowledgeElements);
      findCampaignParticipationStub = sinon.stub(campaignParticipationRepository, 'findByCampaignIdUniqByUserId');
    });

    it('should return the header in CSV styles with all competence, domain and skills', () => {
      // given
      findCampaignParticipationStub.resolves([]);

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
        '"web1";' +
        '"web2";' +
        '"web3";' +
        '"web4";' +
        '"web5"\n';

      // when
      const promise = getResultsCampaignInCsvFormat({
        userId: user.id,
        campaignId: campaign.id,
        campaignRepository,
        userRepository,
        targetProfileRepository,
        competenceRepository,
        organizationRepository,
        campaignParticipationRepository,
        smartPlacementAssessmentRepository,
        knowledgeElementRepository,
      });

      // then
      return promise.then((result) => {
        expect(result.csvData).to.contains(csvExpected);
      });
    });

    context('when isShared is true', () => {

      it('should return the complete line with user results for her participation', () => {
        // given
        const factoryCampaignParticipation = domainBuilder.buildCampaignParticipation({ isShared: true, sharedAt: new Date('2019-03-01T23:04:05Z') });
        findCampaignParticipationStub.resolves([factoryCampaignParticipation]);

        const csvSecondLine = `"${organization.name}";` +
          `${campaign.id};` +
          '"Campaign ""Name""";' +
          `"${targetProfile.name}";` +
          `"${user.lastName}";` +
          `"${user.firstName}";` +
          `"${factoryCampaignParticipation.participantExternalId}";` +
          '1;' +
          '2017-05-09;' +
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
          '"KO"\n';

        // when
        const promise = getResultsCampaignInCsvFormat({
          userId: user.id,
          campaignId: campaign.id,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
        });

        // then
        return promise.then((result) => {
          expect(result.csvData).to.contains(csvSecondLine);
        });
      });
    });

    context('when isShared is false', () => {

      it('should return the beginning of the line with user information for her participation', () => {
        // given

        const factoryCampaignParticipation = domainBuilder.buildCampaignParticipation({ isShared: false });
        findCampaignParticipationStub.resolves([factoryCampaignParticipation]);

        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          '"Campaign ""Name""";' +
          `"${targetProfile.name}";` +
          `"${user.lastName}";` +
          `"${user.firstName}";` +
          `"${factoryCampaignParticipation.participantExternalId}";` +
          '1;' +
          '2017-05-09;' +
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
          '"NA"\n';

        // when
        const promise = getResultsCampaignInCsvFormat({
          userId: user.id,
          campaignId: campaign.id,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
        });

        // then
        return promise.then((result) => {
          expect(result.csvData).to.contains(csvSecondLine);
        });
      });
    });
    context('when campaign do not have a idPixLabel', () => {

      beforeEach(() => {
        const factoryCampaignParticipation = domainBuilder.buildCampaignParticipation({ isShared: false });
        findCampaignParticipationStub.resolves([factoryCampaignParticipation]);

        const campaignWithoutIdPixLabel = domainBuilder.buildCampaign({
          name: 'CampaignName',
          code: 'AZERTY123',
          organizationId: organization.id,
          idPixLabel: null,
        });
        campaignRepository.get.resolves(campaignWithoutIdPixLabel);
      });

      it('should return the header in CSV styles with all competence, domain and skills', () => {
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
          '"web1";' +
          '"web2";' +
          '"web3";' +
          '"web4";' +
          '"web5"\n';

        // when
        const promise = getResultsCampaignInCsvFormat({
          userId: user.id,
          campaignId: campaign.id,
          campaignRepository,
          userRepository,
          targetProfileRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
        });

        // then
        return promise.then((result) => {
          expect(result.csvData).to.contains(csvExpected);
        });
      });
    });
  });
});
