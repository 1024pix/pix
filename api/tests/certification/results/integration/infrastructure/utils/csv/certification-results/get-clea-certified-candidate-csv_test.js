import { getCleaCertifiedCandidateCsv } from '../../../../../../../../src/certification/results/infrastructure/utils/csv/certification-results/get-clea-certified-candidate-csv.js';
import { domainBuilder, expect } from '../../../../../../../test-helper.js';

describe('Integration | Application | UseCases | certification-results | get-clea-certified-candidate-csv', function () {
  context('#getCleaCertifiedCandidateCsv', function () {
    context('when at least one candidate has passed a clea certification', function () {
      it("returns a csv with candidate's information", async function () {
        // given
        const BOM = '\uFEFF';
        const CleaCertifiedCandidate1 = domainBuilder.buildCleaCertifiedCandidate({
          firstName: 'Léane',
          lastName: 'Bern',
          resultRecipientEmail: 'princesse-lele@gg.fr',
          birthdate: '2001-05-10',
          birthplace: 'Paris',
          birthPostalCode: '75019',
          birthINSEECode: '75119',
          birthCountry: 'FRANCE',
          sex: 'F',
          createdAt: new Date('2020-02-01'),
        });
        const CleaCertifiedCandidate2 = domainBuilder.buildCleaCertifiedCandidate({
          firstName: 'Jean-Mi',
          lastName: 'Mi',
          resultRecipientEmail: 'jean-mi@coco.fr',
          birthdate: '2001-02-07',
          birthplace: 'Paris',
          birthPostalCode: '75015',
          birthINSEECode: '75115',
          birthCountry: 'FRANCE',
          sex: 'M',
          createdAt: new Date('2020-02-01'),
        });

        // when
        const result = await getCleaCertifiedCandidateCsv({
          cleaCertifiedCandidates: [CleaCertifiedCandidate1, CleaCertifiedCandidate2],
        });

        // then
        const headers =
          '"SIREN de l\'organisme";"Siret de l\'établissement";"Statut à l\'inscription";"Niveau d\'instruction";"Origine de la démarche";"Financeur";"Civilité";"Nom de naissance";"Nom d\'usage";"Prénom";"Email";"Téléphone";"Adresse";"Complément d\'adresse";"Ville";"Code postal";"Date de naissance";"Né à l\'étranger";"Zone géographique de naissance";"Né en collectivité d\'outre-mer";"Ville de naissance";"Code postal de naissance";"Date de passage";"CCPI";"Statut";"Obtention après la première évaluation ?"\n';
        const CleaCertifiedCandidate1Data =
          ';;;;;;"MME";"Bern";;"Léane";"princesse-lele@gg.fr";;;;;;"10/05/2001";"NON";;"NON";"Paris";"75019";"01/02/2020";"CléA Numérique by Pix";"CERTIFIE";\n';
        const CleaCertifiedCandidate2Data =
          ';;;;;;"M";"Mi";;"Jean-Mi";"jean-mi@coco.fr";;;;;;"07/02/2001";"NON";;"NON";"Paris";"75015";"01/02/2020";"CléA Numérique by Pix";"CERTIFIE";';

        const expectedResult = BOM + headers + CleaCertifiedCandidate1Data + CleaCertifiedCandidate2Data;

        expect(result).to.equal(expectedResult);
      });
      context('when clea certified candidates are born in french outermost region', function () {
        it('should return csvContent with correct geographic area code and correct outermost born value', async function () {
          // given
          const CleaCertifiedCandidate = domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Léane',
            lastName: 'Bern',
            resultRecipientEmail: 'princesse-lele@gg.fr',
            birthdate: '2001-05-10',
            birthplace: 'STE MARIE',
            birthPostalCode: '97418',
            birthINSEECode: '97418',
            birthCountry: 'FRANCE',
            sex: 'F',
            createdAt: new Date('2020-02-01'),
          });

          // when
          const result = await getCleaCertifiedCandidateCsv({ cleaCertifiedCandidates: [CleaCertifiedCandidate] });

          // then
          const expectedResult = [
            { header: '"Né à l\'étranger"', value: '"NON"' },
            { header: '"Zone géographique de naissance"', value: '' },
            { header: '"Né en collectivité d\'outre-mer"', value: '"OUI"' },
          ];
          expectedResult.map(({ header, value }) => {
            expect(_getValueFromHeader(header, result)).to.be.equal(value);
          });
        });
      });
      context('when clea certified candidates are born in foreign country', function () {
        it('should return csvContent with correct foreign born value', async function () {
          // given
          const CleaCertifiedCandidate = domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Léane',
            lastName: 'Bern',
            resultRecipientEmail: 'princesse-lele@gg.fr',
            birthdate: '2001-05-10',
            birthplace: 'STE MARIE',
            birthPostalCode: '99416',
            birthINSEECode: '99416',
            birthCountry: 'BRESIL',
            sex: 'F',
            createdAt: new Date('2020-02-01'),
          });

          // when
          const result = await getCleaCertifiedCandidateCsv({ cleaCertifiedCandidates: [CleaCertifiedCandidate] });

          // then
          const expectedResult = [
            { header: '"Né à l\'étranger"', value: '"OUI"' },
            { header: '"Zone géographique de naissance"', value: '"400"' },
            { header: '"Né en collectivité d\'outre-mer"', value: '"NON"' },
          ];
          expectedResult.map(({ header, value }) => {
            expect(_getValueFromHeader(header, result)).to.be.equal(value);
          });
        });
      });
    });
  });

  function _getValueFromHeader(nameHeader, result) {
    const csv = result.split('\n');
    const csvHeader = csv[0].split(';');
    const csvData = csv[1].split(';');
    const indexHeader = csvHeader.findIndex((header) => header === nameHeader);
    return csvData[indexHeader];
  }
});
