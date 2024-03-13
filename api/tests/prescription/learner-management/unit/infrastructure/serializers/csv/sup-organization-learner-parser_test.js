import iconv from 'iconv-lite';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { SupOrganizationLearnerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { CsvImportError } from '../../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../../test-helper.js';
import { getI18n } from '../../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();

const supOrganizationLearnerCsvColumns = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | Infrastructure | SupOrganizationLearnerParser', function () {
  context('when the header is not correctly formed', function () {
    const organizationId = 123;

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['Premier prénom', 'Nom de famille', 'Date de naissance (jj/mm/aaaa)', 'Numéro étudiant'].forEach((field) => {
      context(`when the ${field} column is missing`, function () {
        it('should throw an CsvImportError', async function () {
          const input = supOrganizationLearnerCsvColumns.replace(`${field}`, '').replace(';;', ';');
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SupOrganizationLearnerParser(encodedInput, organizationId, i18n);

          const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());
          expect(error.meta[0]).to.be.an.instanceOf(CsvImportError);
          expect(error.meta[0].code).to.equal('HEADER_REQUIRED');
        });
      });
    });

    context('when there is no checkencoding columns', function () {
      it('should throw an CsvImportError', async function () {
        const input = supOrganizationLearnerCsvColumns.replace('Premier prénom;', '').replace('Numéro étudiant;', '');
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new SupOrganizationLearnerParser(encodedInput, organizationId, i18n);

        const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());

        expect(error.meta[0].code).to.equal('ENCODING_NOT_SUPPORTED');
      });
    });
  });

  context('when the header is correctly formed', function () {
    context('when there is no line', function () {
      it('returns no organization learners', function () {
        const input = supOrganizationLearnerCsvColumns;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new SupOrganizationLearnerParser(encodedInput, 123, i18n);

        const { learners } = parser.parse(parser.getFileEncoding());

        expect(learners).to.be.empty;
      });
    });

    context('when there are lines', function () {
      context('when the data are correct', function () {
        it('returns an organization learner for each line using the CSV column', function () {
          const input = `${supOrganizationLearnerCsvColumns}
          Richard;;;Aldana;;03/02/2013;richard@example.net;etu123;;;;Boxe;Paléo;
          Tomie;;;Katana;;15/01/2015;tomie@example.net;etu124;;;;Musique;Végan;
          `;
          const organizationId = 789;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SupOrganizationLearnerParser(encodedInput, organizationId, i18n);

          const { learners } = parser.parse(parser.getFileEncoding());
          expect(learners).to.eql([
            {
              firstName: 'Richard',
              middleName: undefined,
              thirdName: undefined,
              lastName: 'Aldana',
              preferredLastName: undefined,
              studentNumber: 'etu123',
              email: 'richard@example.net',
              birthdate: '2013-02-03',
              diploma: 'Non reconnu',
              department: undefined,
              educationalTeam: undefined,
              group: undefined,
              studyScheme: 'Non reconnu',
              organizationId: 789,
            },
            {
              firstName: 'Tomie',
              middleName: undefined,
              thirdName: undefined,
              lastName: 'Katana',
              preferredLastName: undefined,
              studentNumber: 'etu124',
              email: 'tomie@example.net',
              birthdate: '2015-01-15',
              diploma: 'Non reconnu',
              department: undefined,
              educationalTeam: undefined,
              group: undefined,
              studyScheme: 'Non reconnu',
              organizationId: 789,
            },
          ]);
        });
      });

      context('when the data are not correct', function () {
        it('should throw an AggregateImportError error on parse', async function () {
          //given
          const invalidDate = '03/13/2013';
          const input = `${supOrganizationLearnerCsvColumns}
          Richard;;;;;${invalidDate};richard@example.net;etu123;;;;Boxe;Paléo;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SupOrganizationLearnerParser(encodedInput, 123, i18n);

          const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          //then
          expect(error).instanceOf(AggregateImportError);
          expect(error.meta).lengthOf(2);
        });

        it('should throw an AggregateImportError error that contains a student number format error', async function () {
          const wrongData = '"é&"';
          const input = `${supOrganizationLearnerCsvColumns}
          Richard;;;;;03/02/2013;richard@example.net;${wrongData};;;;Boxe;Paléo;
          `;

          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SupOrganizationLearnerParser(encodedInput, 123, i18n);

          const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          //then
          expect(error).instanceOf(AggregateImportError);
          expect(error.meta[0].code).to.equal('STUDENT_NUMBER_FORMAT');
          expect(error.meta[0].meta).to.deep.equal({ line: 2, field: 'Numéro étudiant' });
        });

        it('should throw an AggregateImportError error that contains a student number duplicate error', async function () {
          const input = `${supOrganizationLearnerCsvColumns}
              Richard;;;Aldana;;03/02/2013;richard@example.net;etu123;;;;Boxe;Paléo;
              Tomie;;;Katana;;15/01/2015;tomie@example.net;etu123;;;;Musique;Végan;
`;

          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SupOrganizationLearnerParser(encodedInput, 123, i18n);

          const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          //then
          expect(error).instanceOf(AggregateImportError);
          expect(error.meta[0].code).to.equal('STUDENT_NUMBER_UNIQUE');
          expect(error.meta[0].meta).to.deep.equal({ line: 3, field: 'Numéro étudiant' });
        });
      });
    });
  });
});
