const { expect, domainBuilder, databaseBuilder } = require('../../../../test-helper');
const { getSessionCertificationResultsCsv, getDivisionCertificationResultsCsv } = require('../../../../../lib/infrastructure/utils/csv/certification-results');

describe('Integration | Infrastructure | Utils | csv | certification-results', () => {

  context('#getSessionCertificationResultsCsv', () => {

    context('when no certification has passed complementary certifications', () => {

      it('should return correct csvContent without complementary certification informations', async () => {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const session = databaseBuilder.factory.buildSession({ certificationCenterId });

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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitExpertCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        });
        const certifResult2 = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult2,
          firstName: 'Tom',
          birthdate,
          createdAt,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
          pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        });

        const certificationResults = [ certifResult1, certifResult2 ];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.deep.equal(expectedResult);
      });
    });

    context('when at least one candidate has passed CleA certification', () => {

      it('should return correct csvContent with the CleA information', async () => {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
        const session = databaseBuilder.factory.buildSession({ certificationCenterId });

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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        });
        const certifResult2 = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult2,
          firstName: 'Tom',
          birthdate,
          createdAt,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
        });

        const certificationResults = [ certifResult1, certifResult2 ];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Certification CléA numérique";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Validée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.deep.equal(expectedResult);
      });
    });

    context('when at least one candidate has passed Pix plus maitre certification', () => {

      it('should return correct csvContent with the Pix plus maitre information', async () => {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
        const session = databaseBuilder.factory.buildSession({ certificationCenterId });

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
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        });
        const certifResult2 = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult2,
          firstName: 'Tom',
          birthdate,
          createdAt,
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired(),
        });

        const certificationResults = [ certifResult1, certifResult2 ];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Certification Pix+ Droit Maître";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Validée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.deep.equal(expectedResult);
      });
    });

    context('when at least one candidate has passed Pix plus expert certification', () => {

      it('should return correct csvContent with the Pix plus expert information', async () => {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
        const session = databaseBuilder.factory.buildSession({ certificationCenterId });

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
          pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        });
        const certifResult2 = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult2,
          firstName: 'Tom',
          birthdate,
          createdAt,
          pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired(),
        });

        const certificationResults = [ certifResult1, certifResult2 ];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Certification Pix+ Droit Expert";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Validée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.deep.equal(expectedResult);
      });
    });

    context('when there are several complementary certifications', () => {

      it('should return correct csvContent with complementary informations', async () => {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const session = databaseBuilder.factory.buildSession({ certificationCenterId });

        const birthdate = new Date('1990-01-01');
        const createdAt = new Date('2020-01-01');

        const competencesWithMark1 = [
          { competence_code: '1.1', level: 0 }, { competence_code: '1.2', level: 1 }, { competence_code: '1.3', level: 5 },
          { competence_code: '5.1', level: 0 }, { competence_code: '5.2', level: -1 },
        ];
        const competencesWithMark2 = [ { competence_code: '5.1', level: 3 }, { competence_code: '5.2', level: -1 } ];
        const competencesWithMark3 = [ { competence_code: '3.2', level: 3 } ];

        const lastAssessmentResult1 = domainBuilder.buildAssessmentResult({
          status: 'validated',
          competenceMarks: competencesWithMark1,
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark2,
        });
        const lastAssessmentResult3 = domainBuilder.buildAssessmentResult({
          status: 'validated',
          competenceMarks: competencesWithMark3,
        });

        const certifResult1 = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult1,
          firstName: 'Lili',
          birthdate,
          createdAt,
          pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired(),
        });
        const certifResult2 = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult2,
          firstName: 'Tom',
          birthdate,
          createdAt,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.rejected(),
        });
        const certifResult3 = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult3,
          firstName: 'Bob',
          birthdate,
          createdAt,
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired(),
        });

        const certificationResults = [ certifResult1, certifResult2, certifResult3 ];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Certification Pix+ Droit Maître";"Certification Pix+ Droit Expert";"Certification CléA numérique";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Non passée";"Validée";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Non passée";"Non passée";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
        `"${certifResult3.id}";"Bob";"${certifResult3.lastName}";"${expectedBirthDate}";"${certifResult3.birthplace}";"${certifResult3.externalId}";"Validée";"Non passée";"Non passée";31;"-";"-";"-";"-";"-";"-";"-";"-";3;"-";"-";"-";"-";"-";"-";"-";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });

  context('#getDivisionCertificationResultsCsv', () => {

    it('returns a csv without session informations', async () => {
      // given
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
        sessionId: 'sessionId1',
      });
      const certifResult2 = domainBuilder.buildCertificationResult({
        lastAssessmentResult: lastAssessmentResult2,
        firstName: 'Tom',
        birthdate,
        createdAt,
        sessionId: 'sessionId2',
      });

      const certificationResults = [ certifResult1, certifResult2 ];

      // when
      const result = await getDivisionCertificationResultsCsv({ certificationResults });

      // then
      const expectedBirthDate = '01/01/1990';
      const expectedCreatedAt = '01/01/2020';
      const expectedResult = '\uFEFF' +
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Date de passage de la certification"\n' +
        `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"${certifResult1.sessionId}";"${expectedCreatedAt}"\n` +
        `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"${certifResult2.sessionId}";"${expectedCreatedAt}"`;
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
