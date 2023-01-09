const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | certification-centers-controller-post-import-sessions', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    return knex('sessions').delete();
  });

  describe('POST /api/certification-centers/{certificationCenterId}/sessions/import', function () {
    context('when user imports sessions', function () {
      it('should return status 200', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();

        const newBuffer = `N° de session;* Nom du site;* Nom de la salle;* Date de début;* Heure de début (heure locale);* Surveillant(s);Observations (optionnel);* Nom de naissance;* Prénom;* Date de naissance (format: jj/mm/aaaa);* Sexe (M ou F);Code Insee;Code postal;Nom de la commune;* Pays;E-mail du destinataire des résultats (formateur, enseignant…);E-mail de convocation;Identifiant local;Temps majoré ?;Tarification part Pix;Code de prépaiement
        ;site1;salle1;2022-10-19;12:00;surveillant;non;;;;;;;;;;;;;;`;

        const options = {
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/sessions/import`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: newBuffer,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(await knex('sessions')).to.have.length(1);
      });
    });
  });
});
