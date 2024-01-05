import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { CenterTypes } from '../../../../src/certification/session/domain/models/CenterTypes.js';

describe('Acceptance | Controller | certification-center-controller-get-import-template', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-centers/{certificationCenterId}/import', function () {
    context('when user requests sessions import template', function () {
      it('should return a csv file', async function () {
        // given
        const BOM_CHAR = '\ufeff';
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          externalId: 1234,
          type: CenterTypes.SUP,
        }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/certification-centers/${certificationCenterId}/import`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).to.include('filename=import-sessions');
        expect(response.payload).to.equal(
          `${BOM_CHAR}"Numéro de session préexistante";"* Nom du site";"* Nom de la salle";"* Date de début (format: JJ/MM/AAAA)";"* Heure de début (heure locale format: HH:MM)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: JJ/MM/AAAA)";"* Sexe (M ou F)";"Code INSEE de la commune de naissance";"Code postal de la commune de naissance";"Nom de la commune de naissance";"* Pays de naissance";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant externe";"Temps majoré ? (exemple format: 33%)";"* Tarification part Pix (Gratuite, Prépayée ou Payante)";"Code de prépaiement (si Tarification part Pix Prépayée)"`,
        );
      });

      context('when the certification center is SCO', function () {
        it('should return a csv file without billing mode', async function () {
          // given
          const BOM_CHAR = '\ufeff';
          const userId = databaseBuilder.factory.buildUser().id;
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
            externalId: 1234,
            type: CenterTypes.SCO,
          }).id;
          databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/certification-centers/${certificationCenterId}/import`,
            payload: {},
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.headers['content-type']).to.equal('text/csv; charset=utf-8');
          expect(response.headers['content-disposition']).to.include('filename=import-sessions');
          expect(response.payload).to.equal(
            `${BOM_CHAR}"Numéro de session préexistante";"* Nom du site";"* Nom de la salle";"* Date de début (format: JJ/MM/AAAA)";"* Heure de début (heure locale format: HH:MM)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: JJ/MM/AAAA)";"* Sexe (M ou F)";"Code INSEE de la commune de naissance";"Code postal de la commune de naissance";"Nom de la commune de naissance";"* Pays de naissance";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant externe";"Temps majoré ? (exemple format: 33%)"`,
          );
        });
      });
    });
  });
});
