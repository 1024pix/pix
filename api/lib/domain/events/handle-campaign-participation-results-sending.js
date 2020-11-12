const { checkEventType } = require('./check-event-type');
const CampaignParticipationResultsShared = require('./CampaignParticipationResultsShared');

const eventType = CampaignParticipationResultsShared;

async function handleCampaignParticipationResultsSending({
  event,
  organizationRepository,
  userRepository,
}) {
  checkEventType(event, eventType);

  const { organizationId, userId, isAssessment } = event;

  const organization = await organizationRepository.get(organizationId);
  
  if (isAssessment && organization.isPoleEmploi) {
    
    const user = await userRepository.get(userId);
  
    const resultsToSend = {
      campagne: {
        nom: 'Campagne Pôle Emploi',
        dateDebut: new Date('2020-01-01'),
        dateFin: new Date('2020-02-01'),
        type: 'EVALUATION',
        idCampagne: 11223344,
        codeCampagne: 'CODEPE123',
        urlCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
        nomOrganisme: 'Pix',
        typeOrganisme: 'externe',
      },
      individu: {
        nom: user.lastName,
        prenom: user.firstName,
      },
      test: {
        etat: 4,
        progression: 100,
        typeTest: 'DI',
        referenceExterne: 55667788,
        dateDebut: new Date('2020-01-02'),
        dateProgression: new Date('2020-01-03'),
        dateValidation: new Date('2020-01-03'),
        evaluationCible: 62.47,
        uniteEvaluation: 'A',
        elementsEvalues: [{
          libelle: 'Gérer des données',
          categorie: 'competence',
          type: 'competence Pix',
          domaineRattachement: 'Information et données',
          nbSousElements: 3,
          evaluation: {
            scoreObtenu: 66.6,
            uniteScore: 'A',
            nbSousElementValide: 2,
          },
        },
        {
          libelle: 'Gérer des données 2',
          categorie: 'competence 2',
          type: 'competence Pix 2',
          domaineRattachement: 'Information et données',
          nbSousElements: 5,
          evaluation: {
            scoreObtenu: 60.0,
            uniteScore: 'B',
            nbSousElementValide: 3,
          },
        }],
      },
    };
    console.log(JSON.stringify(resultsToSend));
  }
}

handleCampaignParticipationResultsSending.eventType = eventType;
module.exports = handleCampaignParticipationResultsSending;
