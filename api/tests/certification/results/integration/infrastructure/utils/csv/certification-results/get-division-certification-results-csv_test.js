import dayjs from 'dayjs';

import { getDivisionCertificationResultsCsv } from '../../../../../../../../src/certification/results/infrastructure/utils/csv/certification-results/get-division-certification-results-csv.js';
import { AutoJuryCommentKeys } from '../../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { domainBuilder, expect } from '../../../../../../../test-helper.js';
import { getI18n } from '../../../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();
const translate = i18n.__;

describe('Certification | Results | Integration | Infrastructure | Utils | certification-results | get-division-certification-results-csv', function () {
  context('#getDivisionCertificationResultsCsv', function () {
    context('when at least one candidate has passed a certification', function () {
      it('returns a csv without session information', async function () {
        // given
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '1.1', level: 0 }),
          domainBuilder.buildCompetenceMark({ competence_code: '1.2', level: 1 }),
          domainBuilder.buildCompetenceMark({ competence_code: '1.3', level: 5 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 0 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];

        const certificationResult = domainBuilder.buildCertificationResult.validated({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            fallbackComment: 'RAS',
          }),
          competencesWithMark: competencesWithMark,
          sessionId: 777,
          complementaryCertificationCourseResults: [],
        });

        const certificationResults = [certificationResult];

        // when
        const result = await getDivisionCertificationResultsCsv({ division: 777, certificationResults, i18n });

        // then
        const expectedDate = dayjs().format('YYYYMMDD');
        const expectedFilename = `${expectedDate}_resultats_777.csv`;
        const expectedContent =
          '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n' +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Validée";55;0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";777;"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });
    });

    context('when certification has been rejected', function () {
      context('when the reason is insufficient correct answers', function () {
        it('should return correct comment for organization in csvContent', async function () {
          // given
          const competencesWithMark = [
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ];

          const certificationResult = domainBuilder.buildCertificationResult.rejected({
            id: 456,
            lastName: 'Cambridge',
            firstName: 'Tom',
            birthdate: '1993-05-21',
            birthplace: 'TheMoon',
            externalId: 'TOTODGE',
            createdAt: new Date('2020-02-02'),
            pixScore: 66,
            sessionId: 777,
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
            }),
            competencesWithMark: competencesWithMark,
            complementaryCertificationCourseResults: [],
          });
          const certificationResults = [certificationResult];

          // when
          const result = await getDivisionCertificationResultsCsv({ division: 777, certificationResults, i18n });

          // then
          const expectedDate = dayjs().format('YYYYMMDD');
          const expectedFilename = `${expectedDate}_resultats_777.csv`;
          const expectedContent =
            '\uFEFF' +
            '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n' +
            `456;"Tom";"Cambridge";"21/05/1993";"TheMoon";"TOTODGE";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"${translate('jury.comment.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS.organization')}";777;"02/02/2020"`;
          expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
        });
      });

      context('when the reason is not enough answers', function () {
        it('should return correct comment for organization in csvContent', async function () {
          // given
          const competencesWithMark = [
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ];

          const certificationResult = domainBuilder.buildCertificationResult.rejected({
            id: 456,
            lastName: 'Cambridge',
            firstName: 'Tom',
            birthdate: '1993-05-21',
            birthplace: 'TheMoon',
            externalId: 'TOTODGE',
            createdAt: new Date('2020-02-02'),
            pixScore: 66,
            sessionId: 777,
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
            }),
            competencesWithMark: competencesWithMark,
            complementaryCertificationCourseResults: [],
          });
          const certificationResults = [certificationResult];

          // when
          const result = await getDivisionCertificationResultsCsv({ division: 777, certificationResults, i18n });

          // then
          const expectedDate = dayjs().format('YYYYMMDD');
          const expectedFilename = `${expectedDate}_resultats_777.csv`;
          const expectedContent =
            '\uFEFF' +
            '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n' +
            `456;"Tom";"Cambridge";"21/05/1993";"TheMoon";"TOTODGE";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"${translate('jury.comment.REJECTED_DUE_TO_LACK_OF_ANSWERS.organization')}";777;"02/02/2020"`;
          expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
        });
      });
    });

    context('when at least one certification course is cancelled', function () {
      it('should return correct csvContent with cancelled status and dashes as Pix scores', async function () {
        // given
        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];
        const certificationResult = domainBuilder.buildCertificationResult.cancelled({
          id: 123,
          lastName: 'Oxford',
          firstName: 'Lili',
          birthdate: '1990-01-04',
          birthplace: 'Torreilles',
          externalId: 'LOLORD',
          createdAt: new Date('2020-01-01'),
          pixScore: 55,
          sessionId: 777,
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            fallbackComment: 'RAS',
          }),
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [],
        });

        const certificationResults = [certificationResult];

        // when
        const result = await getDivisionCertificationResultsCsv({ division: 777, certificationResults, i18n });

        // then
        const expectedDate = dayjs().format('YYYYMMDD');
        const expectedFilename = `${expectedDate}_resultats_777.csv`;
        const expectedContent =
          '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n' +
          '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"RAS";777;"01/01/2020"';
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });
    });
  });
});
