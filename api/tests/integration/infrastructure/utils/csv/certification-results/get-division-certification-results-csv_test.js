import dayjs from 'dayjs';
import { expect, domainBuilder } from '../../../../../test-helper.js';

import { getDivisionCertificationResultsCsv } from '../../../../../../lib/infrastructure/utils/csv/certification-results/get-division-certification-results-csv.js';

import { getI18n } from '../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();

const REJECTED_AUTOMATICALLY_COMMENT =
  "Le candidat a répondu faux à plus de 50% des questions posées, cela a invalidé l'ensemble de sa certification, et a donc entraîné un score de 0 pix";

describe('Integration | Application | UseCases | certification-results | get-division-certification-results-csv', function () {
  context('#getDivisionCertificationResultsCsv', function () {
    context('when at least one candidate has passed a certification', function () {
      it('returns a csv without session informations', async function () {
        // given
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
          sessionId: 777,
          complementaryCertificationCourseResults: [],
        });

        const certificationResults = [certifResult];

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
    context('when certification has been rejected automatically', function () {
      it('should return correct csvContent with automatically rejected comment for organization', async function () {
        // given

        const competencesWithMark = [
          domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
          domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
        ];

        const certifResult = domainBuilder.buildCertificationResult.rejected({
          id: 456,
          lastName: 'Cambridge',
          firstName: 'Tom',
          birthdate: '1993-05-21',
          birthplace: 'TheMoon',
          externalId: 'TOTODGE',
          createdAt: new Date('2020-02-02'),
          pixScore: 66,
          sessionId: 777,
          commentForOrganization: null,
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [],
        });
        const certificationResults = [certifResult];

        // when
        const result = await getDivisionCertificationResultsCsv({ division: 777, certificationResults, i18n });

        // then
        const expectedDate = dayjs().format('YYYYMMDD');
        const expectedFilename = `${expectedDate}_resultats_777.csv`;
        const expectedContent =
          '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Date de passage de la certification"\n' +
          `456;"Tom";"Cambridge";"21/05/1993";"TheMoon";"TOTODGE";"Rejetée";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"${REJECTED_AUTOMATICALLY_COMMENT}";777;"02/02/2020"`;
        expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
      });
    });

    context('when at least one certification course is cancelled', function () {
      it('should return correct csvContent with cancelled status and dashes as Pix scores', async function () {
        // given
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
          sessionId: 777,
          commentForOrganization: 'RAS',
          competencesWithMark: competencesWithMark,
          complementaryCertificationCourseResults: [],
        });

        const certificationResults = [certifResult];

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
