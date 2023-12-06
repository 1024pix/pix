import { expect, domainBuilder } from '../../../../../test-helper.js';

import { getSessionCertificationResultsCsv } from '../../../../../../lib/infrastructure/utils/csv/certification-results/get-session-certification-results-csv.js';

import { getI18n } from '../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();

const REJECTED_AUTOMATICALLY_COMMENT =
  "Le candidat a répondu faux à plus de 50% des questions posées, cela a invalidé l'ensemble de sa certification, et a donc entraîné un score de 0 pix";

describe('Integration | Application | UseCases | certification-results | get-session-certification-results-csv', function () {
  context('#getSessionCertificationResultsCsv', function () {
    context('when no certification has passed complementary certifications', function () {
      it('should return correct csvContent without complementary certification informations', async function () {
        // given
        const session = domainBuilder.buildSession({ id: 777, certificationCenter: 'CentreCertif' });
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '1.1', level: 0 }),
          domainBuilder.buildCompetenceMark({ competence_code: '1.2', level: 1 }),
          domainBuilder.buildCompetenceMark({ competence_code: '1.3', level: 5 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 0 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];

        const certifResult = domainBuilder.buildCertificationResult.validated({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          commentForOrganization: 'RAS',
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [],
        });

        const certificationResults = [certifResult];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults, i18n });

        // then
        const expectedFilename = '20210101_1430_resultats_session_777.csv';
        const expectedContent =
          '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Validée";55;0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";777;"CentreCertif";"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });

      context('when certification has been rejected automatically', function () {
        it('should return correct csvContent with automatically rejected comment for organization', async function () {
          // given
          const session = domainBuilder.buildSession({ id: 777, certificationCenter: 'CentreCertif' });

          const competencesWithMark = [
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ];

          const automaticallyRejectedCertificationResult = domainBuilder.buildCertificationResult.rejected({
            id: 456,
            lastName: 'Cambridge',
            firstName: 'Tom',
            birthdate: '1993-05-21',
            birthplace: 'TheMoon',
            externalId: 'TOTODGE',
            createdAt: new Date('2020-02-02'),
            pixScore: 66,
            commentForOrganization: null,
            competencesWithMark: competencesWithMark,
            complementaryCertificationCourseResults: [],
          });
          const certificationResults = [automaticallyRejectedCertificationResult];

          // when
          const result = await getSessionCertificationResultsCsv({ session, certificationResults, i18n });

          // then
          const expectedFilename = '20210101_1430_resultats_session_777.csv';
          const expectedContent =
            '\uFEFF' +
            '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
            `456;"Tom";"Cambridge";"21/05/1993";"TheMoon";"TOTODGE";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"${REJECTED_AUTOMATICALLY_COMMENT}";777;"CentreCertif";"02/02/2020"`;
          expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
        });
      });
    });

    context('when certification is cancelled', function () {
      it('should return correct csvContent with cancelled status and dashes as Pix scores', async function () {
        // given
        const session = domainBuilder.buildSession({ id: 777, certificationCenter: 'CentreCertif' });
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];
        const certifResult = domainBuilder.buildCertificationResult.cancelled({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          commentForOrganization: 'RAS',
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [],
        });

        const certificationResults = [certifResult];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults, i18n });

        // then
        const expectedFilename = '20210101_1430_resultats_session_777.csv';
        const expectedContent =
          '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"RAS";777;"CentreCertif";"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });
    });

    context('when at least one certification course is in error', function () {
      it('should return correct csvContent with error status and dashes as Pix scores', async function () {
        // given
        const session = domainBuilder.buildSession({ id: 777, certificationCenter: 'CentreCertif' });
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];
        const certifResult = domainBuilder.buildCertificationResult.error({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          commentForOrganization: 'RAS',
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [],
        });

        const certificationResults = [certifResult];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults, i18n });

        // then
        const expectedFilename = '20210101_1430_resultats_session_777.csv';
        const expectedContent =
          '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"En erreur";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"RAS";777;"CentreCertif";"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });
    });

    context(`when at least one candidate has passed PIX_EMPLOI_CLEA_V3 certification`, function () {
      it(`should return correct csvContent with the PIX_EMPLOI_CLEA_V3 information`, async function () {
        // given
        const expectedHeader = 'Certification skateboard numérique';
        const label = 'skateboard numérique';
        const session = domainBuilder.buildSession({ id: 777, certificationCenter: 'CentreCertif' });
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];
        const certifResult = domainBuilder.buildCertificationResult.validated({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          commentForOrganization: 'RAS',
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({ acquired: true, label }),
          ],
        });

        const certificationResults = [certifResult];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults, i18n });

        // then
        const expectedFilename = '20210101_1430_resultats_session_777.csv';
        const expectedContent =
          '\uFEFF' +
          `"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"${expectedHeader}";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n` +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Validée";"Validée";55;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";3;0;"RAS";777;"CentreCertif";"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });

      it(`should return a cancelled complementary certification when certification pix is cancelled`, async function () {
        // given
        const expectedHeader = 'Certification skateboard numérique';
        const label = 'skateboard numérique';
        const session = domainBuilder.buildSession({ id: 777, certificationCenter: 'CentreCertif' });
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];
        const certifResult = domainBuilder.buildCertificationResult.cancelled({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          commentForOrganization: 'RAS',
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({ acquired: true, label }),
          ],
        });

        const certificationResults = [certifResult];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults, i18n });

        // then
        const expectedFilename = '20210101_1430_resultats_session_777.csv';
        const expectedContent =
          '\uFEFF' +
          `"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"${expectedHeader}";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n` +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Annulée";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"RAS";777;"CentreCertif";"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });
    });

    context('when there are several complementary certifications', function () {
      it('should return correct csvContent with complementary informations', async function () {
        // given
        const session = domainBuilder.buildSession({ id: 777, certificationCenter: 'CentreCertif' });
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];
        const certifResult = domainBuilder.buildCertificationResult.validated({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          commentForOrganization: 'RAS',
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              id: 1,
              acquired: false,
              label: 'Pix+ Bandjo Maître',
            }),
            domainBuilder.buildComplementaryCertificationCourseResult({
              id: 2,
              acquired: true,
              label: 'Pix+ Bandjo Expert',
            }),
          ],
        });

        const certificationResults = [certifResult];

        // when
        const result = await getSessionCertificationResultsCsv({ session, certificationResults, i18n });

        // then
        const expectedFilename = '20210101_1430_resultats_session_777.csv';
        const expectedContent =
          '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Certification Pix+ Bandjo Maître";"Certification Pix+ Bandjo Expert";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Validée";"Rejetée";"Validée";55;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";3;0;"RAS";777;"CentreCertif";"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });
    });
  });
});
