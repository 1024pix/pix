const { checkEventType } = require('./check-event-type');
const CampaignParticipationResultsShared = require('./CampaignParticipationResultsShared');

const eventType = CampaignParticipationResultsShared;

async function handleCampaignParticipationResultsSending({
  event,
  organizationRepository,
}) {
  checkEventType(event, eventType);

  const organization = await organizationRepository.get(event.organizationId);
  if (event.isAssessment && organization.isPoleEmploi) {

    const resultsToSend = {
      resultatIndividu: {
        campagne: {
          nom: 'Campagne Pôle Emploi',
          dateDebut: new Date('2020-01-01'),
          dateFin: new Date('2020-02-01'),
          typeCampagne: 'EVALUATION',
          idCampagne: 11223344,
          codeCampagne: 'CODEPE123',
          URLCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
          nomOrganisme: 'Pix',
          typeOrganisme: 'externe',
        },
        individu: {
          nom: 'Bonneau',
          prenom: 'Jean',
        },
        test: {
          etat: 4,
          progression: 100,
          typeTest: 'DI',
          referenceExterne: 55667788,
          dateDebut: new Date('2020-01-02'),
          dateModification: new Date('2020-01-03'),
          dateValidation: new Date('2020-01-03'),
          evaluationCible: 42.5,
          uniteValidation: 'A',
          elementsEvalues: [{
            libelle: 'Gérer des données',
            categorie: 'compétence',
            type: 'compétence Pix',
            domaineRattachement: 'Information et données',
            nbSousElements: 3,
            evaluation: {
              scoreObtenu: 14.2,
              uniteScore: 'A',
              nbSousElementValide: 2,
            },
          }],
        },
      },
    };
    console.log(JSON.stringify(resultsToSend));
  }
}

handleCampaignParticipationResultsSending.eventType = eventType;
module.exports = handleCampaignParticipationResultsSending;
