import { expect } from '../../../../../test-helper.js';
import { getHeaders } from '../../../../../../src/certification/session/infrastructure/files/sessions-import.js';
const BOM_CHAR = '\ufeff';
describe('Integration | Infrastructure | Files | sessions-import', function () {
  context('#getHeaders', function () {
    context('when should display billing mode', function () {
      context('when no habilitation labels are passed', function () {
        it('should return the correct values without complementary certification columns', function () {
          // when
          const habilitationLabels = [];
          const shouldDisplayBillingModeColumns = true;
          const result = getHeaders({ habilitationLabels, shouldDisplayBillingModeColumns });

          // then
          const expectedResult = `${BOM_CHAR}"Numéro de session préexistante";"* Nom du site";"* Nom de la salle";"* Date de début (format: JJ/MM/AAAA)";"* Heure de début (heure locale format: HH:MM)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: JJ/MM/AAAA)";"* Sexe (M ou F)";"Code INSEE de la commune de naissance";"Code postal de la commune de naissance";"Nom de la commune de naissance";"* Pays de naissance";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant externe";"Temps majoré ? (exemple format: 33%)";"* Tarification part Pix (Gratuite, Prépayée ou Payante)";"Code de prépaiement (si Tarification part Pix Prépayée)"`;
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
          const expectedResult = `${BOM_CHAR}"Numéro de session préexistante";"* Nom du site";"* Nom de la salle";"* Date de début (format: JJ/MM/AAAA)";"* Heure de début (heure locale format: HH:MM)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: JJ/MM/AAAA)";"* Sexe (M ou F)";"Code INSEE de la commune de naissance";"Code postal de la commune de naissance";"Nom de la commune de naissance";"* Pays de naissance";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant externe";"Temps majoré ? (exemple format: 33%)";"* Tarification part Pix (Gratuite, Prépayée ou Payante)";"Code de prépaiement (si Tarification part Pix Prépayée)";"Pix 1 ('oui' ou laisser vide)";"Pix 2 ('oui' ou laisser vide)"`;
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
        const expectedResult = `${BOM_CHAR}"Numéro de session préexistante";"* Nom du site";"* Nom de la salle";"* Date de début (format: JJ/MM/AAAA)";"* Heure de début (heure locale format: HH:MM)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: JJ/MM/AAAA)";"* Sexe (M ou F)";"Code INSEE de la commune de naissance";"Code postal de la commune de naissance";"Nom de la commune de naissance";"* Pays de naissance";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant externe";"Temps majoré ? (exemple format: 33%)"`;
        expect(result).to.equal(expectedResult);
      });
    });
  });
});
