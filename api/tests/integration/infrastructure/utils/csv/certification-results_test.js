const { expect, domainBuilder, databaseBuilder } = require('../../../../test-helper');
const { getCertificationResultsCsv } = require('../../../../../lib/infrastructure/utils/csv/certification-results');

describe('Integration | Infrastructure | Utils | csv | certification-results', () => {

  describe('#getCertificationResultsCsv', () => {

    it('should return correct csvContent', async () => {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      const session = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      const birthdate = new Date('1990-01-01');
      const createdAt = new Date('2020-01-01');

      const competencesWithMark1 = [
        { competence_code: '1.1', level: 0 }, { competence_code: '1.2', level: 1 }, { competence_code: '1.3', level: 5 },
        { competence_code: '5.1', level: 0 }, { competence_code: '5.2', level: -1 },
      ];
      const competencesWithMark2 = [ { competence_code: '5.1', level: 3 }, { competence_code: '5.2', level: -1 } ];

      const lastAssessmentResult1 = domainBuilder.buildAssessmentResult({
        status: 'validated',
        competenceMarks: competencesWithMark1,
      });
      const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
        status: 'rejected',
        competenceMarks: competencesWithMark2,
      });

      const certifResult1 = domainBuilder.buildCertificationResult({
        lastAssessmentResult: lastAssessmentResult1,
        firstName: 'Lili',
        birthdate,
        createdAt,
      });
      const certifResult2 = domainBuilder.buildCertificationResult({
        lastAssessmentResult: lastAssessmentResult2,
        firstName: 'Tom',
        birthdate,
        createdAt,
      });

      const certificationResults = [ certifResult1, certifResult2 ];

      // when
      const result = await getCertificationResultsCsv({ session, certificationResults });

      // then
      const expectedBirthDate = '01/01/1990';
      const expectedCreatedAt = '01/01/2020';
      const expectedResult = '\uFEFF' +
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
        `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";${certifResult1.externalId};${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;;;"${expectedCreatedAt}"\n` +
        `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";${certifResult2.externalId};"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;;;"${expectedCreatedAt}"`;
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
