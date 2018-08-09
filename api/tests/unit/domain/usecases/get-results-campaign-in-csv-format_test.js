const { expect, sinon, factory } = require('../../../test-helper');

const getResultsCampaignInCsvFormat = require('../../../../lib/domain/usecases/get-results-campaign-in-csv-format');
const Area = require('../../../../lib/domain/models/Area');

describe('Unit | Domain | Use Cases | get-results-campaign-in-csv-format', () => {

  describe('#getResultsCampaignInCsvFormat', () => {

    const userId = 1;
    const campaignId = 1;
    const campaignRepository = { get: () => undefined };
    const userRepository = { getWithOrganizationAccesses: () => undefined };
    const targetProfileRepository = { get: () => undefined };
    const competenceRepository = { list: () => undefined };
    const organizationRepository = { get: () => undefined };
    const campaignParticipationRepository = { findByCampaignId: () => undefined };

    const campaign = factory.buildCampaign({
      name:'CampaignName',
      code:'AZERTY123',
    });
    const competences = [
      {
        name: 'Competence1',
        index: '1.1',
        courseId: 'recComp1',
        skills: ['@web1', '@web2', '@web3', '@web4', '@web5'],
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

    beforeEach(() => {
      campaignRepository.get = sinon.stub().resolves(campaign);
      competenceRepository.list = sinon.stub().resolves(competences);
      targetProfileRepository.get = sinon.stub()
        .resolves(factory.buildTargetProfile({ skills: factory.buildSkillCollection({ name: 'web', minLevel: 1, maxLevel: 4 }) }));
      userRepository.getWithOrganizationAccesses = sinon.stub().resolves();
      organizationRepository.get = sinon.stub().resolves(factory.buildOrganization());
      campaignParticipationRepository.findByCampaignId = sinon.stub().resolves([]);
    });

    it('should return the header in CSV styles with all competence, domain and skills', () => {
      // given
      const csvExpected = '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Profil Cible";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"ID PIX";' +
        '"Nom invité";' +
        '"Prénom invité";' +
        '"Email invité";' +
        '"Champs optionel 1";' +
        '"Champs optionel 2";' +
        '"Champs optionel 3";' +
        '"ID invitation";' +
        '"Statut (invité / participant / terminé)";' +
        '"% de progression";' +
        '"Date entrée (rejoint)";' +
        '"Partage (O/N)";' +
        '"Date du partage";' +
        '"Heure du partage";' +
        '"Nombre de Pix obtenus";' +
        '"Nombre de pix possible";' +
        '"% maitrise de l\'ensemble des acquis du profil";' +
        '"Niveau de la competence Competence1";' +
        '"Pix de la competence Competence1";' +
        '"% de maitrise des acquis pour la competence Competence1";' +
        '"Nombre d\'acquis du profil cible maitrisés / nombre d\'acquis Competence1";' +
        '"% de maitrise des acquis pour le domaine Domain 1";' +
        '"Nombre d\'acquis du profil cible maitrisés / nombre d\'acquis Domain 1";' +
        '"Acquis @web1";' +
        '"Acquis @web2";' +
        '"Acquis @web3";' +
        '"Acquis @web4"\n';

      // when
      const promise = getResultsCampaignInCsvFormat({
        userId,
        campaignId,
        campaignRepository,
        userRepository,
        targetProfileRepository,
        competenceRepository,
        organizationRepository,
        campaignParticipationRepository
      });

      // then
      return promise.then((result) => {
        expect(result).to.equal(csvExpected);
      });
    });
  });
});
