const { expect, domainBuilder, databaseBuilder } = require('../../../../test-helper');
const { getSessionCertificationResultsCsv, getDivisionCertificationResultsCsv } = require('../../../../../lib/infrastructure/utils/csv/certification-results');

describe('Integration | Infrastructure | Utils | csv | certification-results', function() {

  context('#getSessionCertificationResultsCsv', function() {

    context('when no certification has passed complementary certifications', function() {

      it('should return correct csvContent without complementary certification informations', async function() {
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
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark2,
          commentForOrganization: null,
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
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Validée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"${certifResult1.commentForOrganization}";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });

    context('when at least one certification course is cancelled', function() {
      it('should return correct csvContent with cancelled status and dashes as Pix scores', async function() {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const session = databaseBuilder.factory.buildSession({ certificationCenterId });

        const birthdate = new Date('1990-01-01');
        const createdAt = new Date('2020-01-01');

        const competencesWithMark = [
          { competence_code: '1.1', level: 0 }, { competence_code: '1.2', level: 1 }, { competence_code: '1.3', level: 5 },
          { competence_code: '5.1', level: 0 }, { competence_code: '5.2', level: -1 },
        ];

        const lastAssessmentResult1 = domainBuilder.buildAssessmentResult({
          status: 'validated',
          competenceMarks: competencesWithMark,
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark,
          commentForOrganization: null,
        });

        const certifResult = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult1,
          firstName: 'Lili',
          birthdate,
          createdAt,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitExpertCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        });
        const cancelledCertifResult = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult2,
          firstName: 'Tom',
          birthdate,
          createdAt,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
          pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
          isCourseCancelled: true,
        });

        const certificationResults = [ certifResult, cancelledCertifResult ];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult.id}";"Lili";"${certifResult.lastName}";"${expectedBirthDate}";"${certifResult.birthplace}";"${certifResult.externalId}";"Validée";${certifResult.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${cancelledCertifResult.id}";"Tom";"${cancelledCertifResult.lastName}";"${expectedBirthDate}";"${cancelledCertifResult.birthplace}";"${cancelledCertifResult.externalId}";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });

    context('when at least one certification course is in error', function() {
      it('should return correct csvContent with error status and dashes as Pix scores', async function() {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const session = databaseBuilder.factory.buildSession({ certificationCenterId });

        const birthdate = new Date('1990-01-01');
        const createdAt = new Date('2020-01-01');

        const competencesWithMark = [
          { competence_code: '1.1', level: 0 }, { competence_code: '1.2', level: 1 }, { competence_code: '1.3', level: 5 },
          { competence_code: '5.1', level: 0 }, { competence_code: '5.2', level: -1 },
        ];

        const lastAssessmentResult1 = domainBuilder.buildAssessmentResult({
          status: 'validated',
          competenceMarks: competencesWithMark,
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'error',
          competenceMarks: [],
          pixScore: '-',
          commentForOrganization: null,
        });

        const certifResult = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult1,
          firstName: 'Lili',
          birthdate,
          createdAt,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitExpertCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        });
        const cancelledCertifResult = domainBuilder.buildCertificationResult({
          lastAssessmentResult: lastAssessmentResult2,
          firstName: 'Tom',
          birthdate,
          createdAt,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
          pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        });

        const certificationResults = [ certifResult, cancelledCertifResult ];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult.id}";"Lili";"${certifResult.lastName}";"${expectedBirthDate}";"${certifResult.birthplace}";"${certifResult.externalId}";"Validée";${certifResult.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${cancelledCertifResult.id}";"Tom";"${cancelledCertifResult.lastName}";"${expectedBirthDate}";"${cancelledCertifResult.birthplace}";"${cancelledCertifResult.externalId}";"En erreur";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });

    context('when at least one candidate has passed CleA certification', function() {

      it('should return correct csvContent with the CleA information', async function() {
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
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark2,
          commentForOrganization: null,
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
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Certification CléA numérique";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Validée";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Rejetée";"Validée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });

    context('when at least one candidate has passed Pix plus maitre certification', function() {

      it('should return correct csvContent with the Pix plus maitre information', async function() {
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
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark2,
          commentForOrganization: null,
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
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Certification Pix+ Droit Maître";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Validée";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Rejetée";"Validée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });

    context('when at least one candidate has passed Pix plus expert certification', function() {

      it('should return correct csvContent with the Pix plus expert information', async function() {
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
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark2,
          commentForOrganization: null,
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
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Certification Pix+ Droit Expert";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Validée";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Rejetée";"Validée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });

    context('when there are several complementary certifications', function() {

      it('should return correct csvContent with complementary informations', async function() {
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
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark2,
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult3 = domainBuilder.buildAssessmentResult({
          status: 'validated',
          competenceMarks: competencesWithMark3,
          commentForOrganization: null,
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
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Certification Pix+ Droit Maître";"Certification Pix+ Droit Expert";"Certification CléA numérique";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Validée";"Non passée";"Validée";"Non passée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Rejetée";"Non passée";"Non passée";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"\n` +
        `"${certifResult3.id}";"Bob";"${certifResult3.lastName}";"${expectedBirthDate}";"${certifResult3.birthplace}";"${certifResult3.externalId}";"Validée";"Validée";"Non passée";"Non passée";31;"-";"-";"-";"-";"-";"-";"-";"-";3;"-";"-";"-";"-";"-";"-";"-";;${session.id};"${session.certificationCenter}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });
  });

  context('#getDivisionCertificationResultsCsv', function() {

    context('when at least one candidate has passed a certification', function() {

      it('returns a csv without session informations', async function() {
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
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark2,
          commentForOrganization: null,
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
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n' +
          `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Validée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";"${certifResult1.sessionId}";"${expectedCreatedAt}"\n` +
          `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;;"${certifResult2.sessionId}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });

    context('when at least one certification course is cancelled', function() {

      it('returns a csv with cancelled status', async function() {
        // given
        const birthdate = new Date('1990-01-01');
        const createdAt = new Date('2020-01-01');

        const competencesWithMark = [
          { competence_code: '1.1', level: 0 }, { competence_code: '1.2', level: 1 }, { competence_code: '1.3', level: 5 },
          { competence_code: '5.1', level: 0 }, { competence_code: '5.2', level: -1 },
        ];

        const lastAssessmentResult1 = domainBuilder.buildAssessmentResult({
          status: 'validated',
          competenceMarks: competencesWithMark,
          commentForOrganization: 'RAS',
        });
        const lastAssessmentResult2 = domainBuilder.buildAssessmentResult({
          status: 'rejected',
          competenceMarks: competencesWithMark,
          commentForOrganization: null,
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
          isCourseCancelled: true,
        });

        const certificationResults = [ certifResult1, certifResult2 ];

        // when
        const result = await getDivisionCertificationResultsCsv({ certificationResults });

        // then
        const expectedBirthDate = '01/01/1990';
        const expectedCreatedAt = '01/01/2020';
        const expectedResult = '\uFEFF' +
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n' +
        `"${certifResult1.id}";"Lili";"${certifResult1.lastName}";"${expectedBirthDate}";"${certifResult1.birthplace}";"${certifResult1.externalId}";"Validée";${certifResult1.pixScore};0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";"${certifResult1.sessionId}";"${expectedCreatedAt}"\n` +
        `"${certifResult2.id}";"Tom";"${certifResult2.lastName}";"${expectedBirthDate}";"${certifResult2.birthplace}";"${certifResult2.externalId}";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";;"${certifResult2.sessionId}";"${expectedCreatedAt}"`;
        expect(result).to.equal(expectedResult);
      });
    });
  });
});
