const { expect } = require('../../../../test-helper');
const { getHeaders } = require('../../../../../lib/infrastructure/files/sessions-import');
const BOM_CHAR = '\ufeff';
describe('Integration | Infrastructure | Utils | csv | sessions-import', function () {
  context('#getHeaders', function () {
    context('when should display billing mode', function () {
      context('when no habilitation labels are passed', function () {
        it('should return the correct values without complementary certification columns', function () {
          // when
          const habilitationLabels = [];
          const shouldDisplayBillingModeColumns = true;
          const result = getHeaders({ habilitationLabels, shouldDisplayBillingModeColumns });

          // then
          const expectedResult = `${BOM_CHAR}"N° de session";"* Nom du site";"* Nom de la salle";"* Date de début";"* Heure de début (heure locale)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: jj/mm/aaaa)";"* Sexe (M ou F)";"Code Insee";"Code postal";"Nom de la commune";"* Pays";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant local";"Temps majoré ?";"Tarification part Pix";"Code de prépaiement"`;
          expect(result).to.equal(expectedResult);
        });
      });

      context('when habilitation labels are passed', function () {
        it('should return the correct values with complementary certification columns', function () {
          // given
          const habilitationLabels = ['Pix 1', 'Pix 2'];
          const shouldDisplayBillingModeColumns = true;

          // when
          const result = getHeaders({ habilitationLabels, shouldDisplayBillingModeColumns });

          // then
          const expectedResult = `${BOM_CHAR}"N° de session";"* Nom du site";"* Nom de la salle";"* Date de début";"* Heure de début (heure locale)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: jj/mm/aaaa)";"* Sexe (M ou F)";"Code Insee";"Code postal";"Nom de la commune";"* Pays";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant local";"Temps majoré ?";"Tarification part Pix";"Code de prépaiement";"Pix 1 ('oui' ou laisser vide)";"Pix 2 ('oui' ou laisser vide)"`;
          expect(result).to.equal(expectedResult);
        });
      });
    });

    context('when should not display billing mode', function () {
      it('should return the correct values without billing mode columns', function () {
        // when
        const habilitationLabels = [];
        const shouldDisplayBillingModeColumns = false;
        const result = getHeaders({ habilitationLabels, shouldDisplayBillingModeColumns });

        // then
        const expectedResult = `${BOM_CHAR}"N° de session";"* Nom du site";"* Nom de la salle";"* Date de début";"* Heure de début (heure locale)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: jj/mm/aaaa)";"* Sexe (M ou F)";"Code Insee";"Code postal";"Nom de la commune";"* Pays";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant local";"Temps majoré ?"`;
        expect(result).to.equal(expectedResult);
      });
    });
  });
});
