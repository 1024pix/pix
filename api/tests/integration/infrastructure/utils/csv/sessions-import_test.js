const { expect } = require('../../../../test-helper');
const { getHeaders } = require('../../../../../lib/infrastructure/files/sessions-import');
const BOM_CHAR = '\ufeff';
describe('Integration | Infrastructure | Utils | csv | sessions-import', function () {
  context('#getHeaders', function () {
    it('should return the correct values', function () {
      // when
      const result = getHeaders();

      // then
      const expectedResult = `${BOM_CHAR}"N° de session";"* Nom du site";"* Nom de la salle";"* Date de début";"* Heure de début (heure locale)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: jj/mm/aaaa)";"* Sexe (M ou F)";"Code Insee";"Code postal";"Nom de la commune";"* Pays";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant local";"Temps majoré ?";"Tarification part Pix";"Code de prépaiement"`;
      expect(result).to.equal(expectedResult);
    });
  });
});
