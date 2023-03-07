const { poleEmploiEnvoisDoc } = require('../../../../../lib/infrastructure/open-api-doc/pole-emploi/envois-doc');
const { expect } = require('../../../../test-helper');

describe('Unit | Infrastructure | Open API Doc | Pole Emploi | Envois Documentation', function () {
  it('should validate payload for a campaign participation', function () {
    // given
    const resultat = {
      campagne: {
        nom: 'Campagne Pôle Emploi',
        dateDebut: '2020-01-01T00:00:00.000Z',
        dateFin: '2020-02-01T00:00:00.000Z',
        type: 'EVALUATION',
        codeCampagne: 'CODEPE123',
        urlCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
        nomOrganisme: 'Pix',
        typeOrganisme: 'externe',
      },
      individu: {
        nom: 'Bonneau',
        prenom: 'Jean',
        idPoleEmploi: 'A11',
      },
      test: {
        etat: 4,
        progression: 100,
        typeTest: 'DI',
        referenceExterne: 55667788,
        dateDebut: '2020-01-02T00:00:00.000Z',
        dateProgression: '2020-01-03T00:00:00.000Z',
        dateValidation: '2020-01-03T00:00:00.000Z',
        evaluation: 70,
        uniteEvaluation: 'A',
        elementsEvalues: [
          {
            libelle: 'Gérer des données',
            categorie: 'competence',
            type: 'competence Pix',
            domaineRattachement: 'Information et données',
            nbSousElements: 4,
            evaluation: {
              scoreObtenu: 50,
              uniteScore: 'A',
              nbSousElementValide: 2,
            },
          },
          {
            libelle: 'Gérer des données 2',
            categorie: 'competence',
            type: 'competence Pix',
            domaineRattachement: 'Information et données',
            nbSousElements: 3,
            evaluation: {
              scoreObtenu: 100,
              uniteScore: 'A',
              nbSousElementValide: 3,
            },
          },
        ],
      },
    };

    // when
    const result = poleEmploiEnvoisDoc.validate([{ idEnvoi: 1, dateEnvoi: '2020-11-31T12:00:38.133Z', resultat }]);

    // then
    expect(result.error).to.be.undefined;
  });
});
