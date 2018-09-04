const { expect, sinon, factory } = require('../../../test-helper');

const getResultsCampaignInCsvFormat = require('../../../../lib/domain/usecases/get-results-campaign-in-csv-format');
const Area = require('../../../../lib/domain/models/Area');

describe('Unit | Domain | Use Cases | get-results-campaign-in-csv-format', () => {

  describe('#getResultsCampaignInCsvFormat', () => {
    const user = factory.buildUser();
    const organization = user.organizationAccesses[0].organization;
    const listSkills = factory.buildSkillCollection({ name: 'web', minLevel: 1, maxLevel: 4 });
    const assessment = factory.buildAssessment.ofTypeSmartPlacement({
      state: 'completed',
      createdAt: new Date('05/05/2017'),
      knowledgeElements: [
        factory.buildSmartPlacementKnowledgeElement({
          status: 'validated',
          pixScore: 2,
          skillId: 'web1',
        }),
        factory.buildSmartPlacementKnowledgeElement({
          status: 'validated',
          pixScore: 2,
          skillId: 'web2',
        }),
        factory.buildSmartPlacementKnowledgeElement({
          status: 'validated',
          pixScore: 2,
          skillId: 'web3',
        }),
        factory.buildSmartPlacementKnowledgeElement({
          status: 'invalidated',
          pixScore: 2,
          skillId: 'web4',
        })
      ] });

    const targetProfile = factory.buildTargetProfile({ skills: listSkills, name: 'Profile 1' });

    const campaign = factory.buildCampaign({
      name:'CampaignName',
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
        })
      },
      {
        name: 'Competence2',
        index: '3.2',
        courseId: 'recComp2',
        skills: [],
        area: new Area({
          code: '3',
          title: 'Domain 3',
        })
      },
    ];
    const campaignRepository = { get: () => undefined };
    const userRepository = { getWithOrganizationAccesses: () => undefined, get: () => undefined };
    const targetProfileRepository = { get: () => undefined };
    const competenceRepository = { list: () => undefined };
    const organizationRepository = { get: () => undefined };
    const campaignParticipationRepository = { findByCampaignId: () => undefined };
    const smartPlacementAssessmentRepository = { get: () => undefined };

    beforeEach(() => {

      campaignRepository.get = sinon.stub().resolves(campaign);
      competenceRepository.list = sinon.stub().resolves(competences);
      targetProfileRepository.get = sinon.stub().resolves(targetProfile);
      userRepository.getWithOrganizationAccesses = sinon.stub().resolves(user);
      organizationRepository.get = sinon.stub().resolves(organization);
      campaignParticipationRepository.findByCampaignId = sinon.stub().resolves([{
        assessmentId: assessment.id,
        campaign
      }]);
      userRepository.get = sinon.stub().resolves(user);
      smartPlacementAssessmentRepository.get = sinon.stub().resolves(assessment);
    });

    it('should return the header in CSV styles with all competence, domain and skills', () => {
      // given
      const csvExpected = '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Profil Cible";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Mail Pro";' +
        '"Nom invité";' +
        '"Prénom invité";' +
        '"Email invité";' +
        '"Champs optionel 1";' +
        '"Champs optionel 2";' +
        '"Champs optionel 3";' +
        '"ID invitation";' +
        '"% de progression";' +
        '"Date de début";' +
        '"Partage (O/N)";' +
        '"Date du partage";' +
        '"Heure du partage";' +
        '"Nombre de Pix obtenus";' +
        '"Nombre de pix possibles";' +
        '"% maitrise de l\'ensemble des acquis du profil";' +
        '"Niveau de la competence Competence1";' +
        '"Pix de la competence Competence1";' +
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
        smartPlacementAssessmentRepository
      });

      // then
      return promise.then((result) => {
        expect(result.csvData).to.contains(csvExpected);
      });
    });

    it('should return the line with user results for her participation', () => {
      // given
      const csvSecondLine = `"${organization.name}";`+
        `"${campaign.id}";` +
        `"${campaign.name}";` +
        `"${targetProfile.name}";` +
        `"${user.firstName}";` +
        `"${user.lastName}";` +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"100";' +
        '"05/05/2017";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"NA";' +
        '"75";' +
        '"NA";' +
        '"NA";' +
        '"75";' +
        '"3/4";' +
        '"75";' +
        '"3/4";' +
        '"OK";' +
        '"OK";' +
        '"OK";' +
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
      });

      // then
      return promise.then((result) => {
        expect(result.csvData).to.contains(csvSecondLine);
      });
    });

    context('when campaign do not have a idPixLabel', () => {
      beforeEach(() => {
        const campaignWithoutIdPixLabel = factory.buildCampaign({
          name:'CampaignName',
          code:'AZERTY123',
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
          '"Nom invité";' +
          '"Prénom invité";' +
          '"Email invité";' +
          '"Champs optionel 1";' +
          '"Champs optionel 2";' +
          '"Champs optionel 3";' +
          '"ID invitation";' +
          '"% de progression";' +
          '"Date de début";' +
          '"Partage (O/N)";' +
          '"Date du partage";' +
          '"Heure du partage";' +
          '"Nombre de Pix obtenus";' +
          '"Nombre de pix possibles";' +
          '"% maitrise de l\'ensemble des acquis du profil";' +
          '"Niveau de la competence Competence1";' +
          '"Pix de la competence Competence1";' +
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
          smartPlacementAssessmentRepository
        });

        // then
        return promise.then((result) => {
          expect(result.csvData).to.contains(csvExpected);
        });
      });
    });
  });
});
