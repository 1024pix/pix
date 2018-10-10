const { expect, sinon, factory } = require('../../../test-helper');
const moment = require('moment');

const getResultsCampaignInCsvFormat = require('../../../../lib/domain/usecases/get-results-campaign-in-csv-format');
const Area = require('../../../../lib/domain/models/Area');

describe('Unit | Domain | Use Cases | get-results-campaign-in-csv-format', () => {

  describe('#getResultsCampaignInCsvFormat', () => {

    const user = factory.buildUser();
    const organization = user.organizationAccesses[0].organization;
    const listSkills = factory.buildSkillCollection({ name: 'web', minLevel: 1, maxLevel: 4 });
    const [skillWeb1, skillWeb2, skillWeb3, skillWeb4] = listSkills;
    const assessment = factory.buildAssessment.ofTypeSmartPlacement({
      state: 'completed',
      createdAt: new Date('05/05/2017'),
      knowledgeElements: [
        factory.buildSmartPlacementKnowledgeElement({
          status: 'validated',
          pixScore: 2,
          skillId: skillWeb1.id,
        }),
        factory.buildSmartPlacementKnowledgeElement({
          status: 'validated',
          pixScore: 2,
          skillId: skillWeb2.id,
        }),
        factory.buildSmartPlacementKnowledgeElement({
          status: 'validated',
          pixScore: 2,
          skillId: skillWeb3.id,
        }),
        factory.buildSmartPlacementKnowledgeElement({
          status: 'invalidated',
          pixScore: 2,
          skillId: skillWeb4.id,
        }),
      ],
    });

    const targetProfile = factory.buildTargetProfile({ skills: listSkills, name: 'Profile 1' });

    const campaign = factory.buildCampaign({
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
    const userRepository = { getWithOrganizationAccesses: () => undefined, get: () => undefined };
    const targetProfileRepository = { get: () => undefined };
    const competenceRepository = { list: () => undefined };
    const organizationRepository = { get: () => undefined };
    const campaignParticipationRepository = { findByCampaignId: () => undefined };
    const smartPlacementAssessmentRepository = { get: () => undefined };

    let sandbox;
    let findCampaignParticipationStub;

    beforeEach(() => {

      sandbox = sinon.sandbox.create();
      sandbox.stub(campaignRepository, 'get').resolves(campaign);
      sandbox.stub(competenceRepository, 'list').resolves(competences);
      sandbox.stub(targetProfileRepository, 'get').resolves(targetProfile);
      sandbox.stub(userRepository, 'getWithOrganizationAccesses').resolves(user);
      sandbox.stub(organizationRepository, 'get').resolves(organization);
      sandbox.stub(userRepository, 'get').resolves(user);
      sandbox.stub(smartPlacementAssessmentRepository, 'get').resolves(assessment);
      findCampaignParticipationStub = sandbox.stub(campaignParticipationRepository, 'findByCampaignId');
    });

    afterEach(() => {
      sandbox.restore();
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
        '"Nombre d\'acquis du profil cible maitrisés / nombre d\'acquis de la compétence Competence1";' +
        '"% de maitrise des acquis du domaine Domain 1";' +
        '"Nombre d\'acquis du profil cible maitrisés / nombre d\'acquis du domaine Domain 1";' +
        '"Acquis web1";' +
        '"Acquis web2";' +
        '"Acquis web3";' +
        '"Acquis web4"\n';

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
      });

      // then
      return promise.then((result) => {
        expect(result.csvData).to.contains(csvExpected);
      });
    });

    context('when isShared is true', () => {

      it('should return the complete line with user results for her participation', () => {
        // given
        const factoryCampaignParticipation = factory.buildCampaignParticipation({ isShared: true });
        findCampaignParticipationStub.resolves([factoryCampaignParticipation]);

        const csvSecondLine = `="${organization.name}";` +
          `="${campaign.id}";` +
          '="Campaign ""Name""";' +
          `="${targetProfile.name}";` +
          `="${user.firstName}";` +
          `="${user.lastName}";` +
          `="${factoryCampaignParticipation.participantExternalId}";` +
          '100;' +
          '="2017-05-05";' +
          '="Oui";' +
          `="${moment(factoryCampaignParticipation.sharedAt).format('YYYY-MM-DD')}";` +
          '75;' +
          '75;' +
          '="3/4";' +
          '75;' +
          '="3/4";' +
          '="OK";' +
          '="OK";' +
          '="OK";' +
          '="KO"\n';

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

        const factoryCampaignParticipation = factory.buildCampaignParticipation({ isShared: false });
        findCampaignParticipationStub.resolves([factoryCampaignParticipation]);

        const csvSecondLine =
          `="${organization.name}";` +
          `="${campaign.id}";` +
          '="Campaign ""Name""";' +
          `="${targetProfile.name}";` +
          `="${user.firstName}";` +
          `="${user.lastName}";` +
          `="${factoryCampaignParticipation.participantExternalId}";` +
          '100;' +
          '="2017-05-05";' +
          '="Non";' +
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
        });

        // then
        return promise.then((result) => {
          expect(result.csvData).to.contains(csvSecondLine);
        });
      });
    });
    context('when campaign do not have a idPixLabel', () => {

      beforeEach(() => {
        const factoryCampaignParticipation = factory.buildCampaignParticipation({ isShared: false });
        findCampaignParticipationStub.resolves([factoryCampaignParticipation]);

        const campaignWithoutIdPixLabel = factory.buildCampaign({
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
          '"Nombre d\'acquis du profil cible maitrisés / nombre d\'acquis de la compétence Competence1";' +
          '"% de maitrise des acquis du domaine Domain 1";' +
          '"Nombre d\'acquis du profil cible maitrisés / nombre d\'acquis du domaine Domain 1";' +
          '"Acquis web1";' +
          '"Acquis web2";' +
          '"Acquis web3";' +
          '"Acquis web4"\n';

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
        });

        // then
        return promise.then((result) => {
          expect(result.csvData).to.contains(csvExpected);
        });
      });
    });
  });
});
