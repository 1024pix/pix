const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | certification-centers-controller-post-import-sessions', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('certification-cpf-cities').delete();
    await knex('certification-cpf-countries').delete();
    await knex('certification-candidates').delete();
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
        ;site1;salle1;19/10/2022;12:00;surveillant;non;;;;;;;;;;;;;;`;

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

    context('when user imports candidates on existing session with candidates', function () {
      context('when csv first line has sessionId and no session information', function () {
        context('when csv last line has sessionId and session information', function () {
          it('should throw and do nothing', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
            databaseBuilder.factory.buildCertificationCpfCountry({
              commonName: 'FRANCE',
              matcher: 'ACEFNR',
              code: '99100',
            });
            databaseBuilder.factory.buildCertificationCpfCity({
              INSEECode: '75115',
              name: 'Paris',
              isActualName: true,
            });
            databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
            const sessionId = databaseBuilder.factory.buildSession({ id: 1234 }).id;
            databaseBuilder.factory.buildCertificationCandidate({ sessionId, lastName: 'Toto' });
            databaseBuilder.factory.buildCertificationCandidate({ sessionId, lastName: 'Foo' });
            databaseBuilder.factory.buildCertificationCandidate({ sessionId, lastName: 'Bar' });
            await databaseBuilder.commit();

            const newBuffer = `N° de session;* Nom du site;* Nom de la salle;* Date de début;* Heure de début (heure locale);* Surveillant(s);Observations (optionnel);* Nom de naissance;* Prénom;* Date de naissance (format: jj/mm/aaaa);* Sexe (M ou F);Code Insee;Code postal;Nom de la commune;* Pays;E-mail du destinataire des résultats (formateur, enseignant…);E-mail de convocation;Identifiant local;Temps majoré ?;Tarification part Pix;Code de prépaiement
          ${sessionId};;;;;;;Tutu;Jean-Paul;01/01/2000;M;75115;;;FRANCE;;;;;Gratuite;;
          ${sessionId};site1;salle1;19/10/2022;12:00;surveillant;non;Tata;Corinne;01/01/2000;M;75115;;;FRANCE;;;;;Gratuite;;`;

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
            expect(response.statusCode).to.equal(400);
            expect(await knex('sessions')).to.have.length(1);
            expect(await knex('certification-candidates').where({ sessionId })).to.have.length(3);
          });
        });
      });
    });
  });
});
