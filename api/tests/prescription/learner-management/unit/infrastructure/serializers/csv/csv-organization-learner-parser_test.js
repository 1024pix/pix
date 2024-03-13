import iconv from 'iconv-lite';

import { CsvColumn } from '../../../../../../../lib/infrastructure/serializers/csv/csv-column.js';
import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { CsvOrganizationLearnerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/csv-organization-learner-parser.js';
import { catchErr, expect, sinon } from '../../../../../../test-helper.js';

class FakeLearnerSet {
  constructor() {
    this.learners = [];
  }
  addLearner(learner) {
    this.learners.push(learner);
  }
}

describe('Unit | Infrastructure | CsvOrganizationLearnerParser', function () {
  const organizationId = 123;
  let learnerSet;

  beforeEach(function () {
    learnerSet = new FakeLearnerSet();
  });

  context('when the header is correctly formed', function () {
    context('when there are lines', function () {
      const columns = [
        new CsvColumn({ property: 'col1', name: 'Column 1' }),
        new CsvColumn({ property: 'col2', name: 'Column 2' }),
      ];

      it('returns a learnerSet with an organization learner for each line', function () {
        const input = `Column 1;Column 2;
        Beatrix;The;
        O-Ren;;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

        parser.parse(parser.getFileEncoding());

        expect(learnerSet.learners).to.have.lengthOf(2);
      });
    });
    context('when there are different date formats', function () {
      const columns = [
        new CsvColumn({ property: 'col1', name: 'Column 1' }),
        new CsvColumn({ property: 'col2', name: 'Column 2', isDate: true }),
      ];

      it('throws a parsing error', function () {
        const input = `Column 1;Column 2;
        O-Ren;2010-01-20;
        O-Ren;20/01/2010;
        O-Ren;20/01/10;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

        parser.parse(parser.getFileEncoding());

        expect(learnerSet.learners[0].col2).to.equal('2010-01-20');
        expect(learnerSet.learners[1].col2).to.equal('2010-01-20');
        expect(learnerSet.learners[2].col2).to.equal('2010-01-20');
      });
    });

    context('when there is a validation error', function () {
      const columns = [new CsvColumn({ property: 'property', name: 'ColumnLabel' })];

      const error = [];
      beforeEach(function () {
        learnerSet.addLearner = function () {
          throw error;
        };
      });

      it('should throw an error including line number', async function () {
        error[0] = new Error();
        error[0].key = 'property';
        error[0].why = 'required';

        learnerSet.addLearner = sinon.stub().onThirdCall().throws(error);
        const input = `ColumnLabel;
        Beatrix1;
        Beatrix2;
        Beatrix3;
        `;

        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

        const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

        expect(parsingErrors.meta[0].meta.line).to.equal(4);
      });

      context('when error.why is min_length', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'min_length';
          error[0].limit = 12;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_MIN_LENGTH');
          expect(parsingErrors.meta[0].meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 12 });
        });
      });

      context('when error.why is max_length', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'max_length';
          error[0].limit = 8;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_MAX_LENGTH');
          expect(parsingErrors.meta[0].meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 8 });
        });
      });

      context('when error.why is required', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'required';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_REQUIRED');
          expect(parsingErrors.meta[0].meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is bad_values', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'bad_values';
          error[0].valids = ['value1', 'value2', 'value3'];

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_BAD_VALUES');
          expect(parsingErrors.meta[0].meta).to.deep.equal({
            line: 2,
            field: 'ColumnLabel',
            valids: ['value1', 'value2', 'value3'],
          });
        });
      });

      context('when error.length is bad_values', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'length';
          error[0].limit = 2;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_LENGTH');
          expect(parsingErrors.meta[0].meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 2 });
        });
      });

      context('when error.why is date_format', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'date_format';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_DATE_FORMAT');
          expect(parsingErrors.meta[0].meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is not_a_date', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'not_a_date';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_DATE_FORMAT');
          expect(parsingErrors.meta[0].meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is email_format', function () {
        it('throws a parsing error', async function () {
          error[0] = new Error();
          error[0].key = 'property';
          error[0].why = 'email_format';

          const input = `ColumnLabel;
          boeuf_bourguignon@chef..com;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingErrors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

          expect(parsingErrors.meta[0].code).to.equal('FIELD_EMAIL_FORMAT');
          expect(parsingErrors.meta[0].meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });
    });
  });

  context('When file does not match requirements', function () {
    const columns = [
      new CsvColumn({ property: 'col1', name: 'Column 1', isRequired: true }),
      new CsvColumn({ property: 'col2', name: 'Column 2' }),
      new CsvColumn({ property: 'col1', name: 'Column 3', isRequired: true }),
    ];

    it('should throw an error if the file is not csv', async function () {
      const input = `Column 1\\Column 2\\Column 3\\
      Beatrix\\The\\Blob\\`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

      const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(error.meta[0].code).to.equal('ENCODING_NOT_SUPPORTED');
    });

    it('should throw all errors on missing header', async function () {
      const input = `Column 2;
      The;;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

      const errors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(errors).instanceOf(AggregateImportError);
      expect(errors.meta).to.lengthOf(2);
      expect(errors.meta[0].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[0].meta.field).to.equal('Column 1');
      expect(errors.meta[1].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[1].meta.field).to.equal('Column 3');
    });

    it('should throw all errors on unknown header', async function () {
      const input = `Column 1;Column 3;GodZilla;King Kong;
      The;;;;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

      const errors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(errors.meta).to.lengthOf(2);

      expect(errors.meta[0].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[0].meta.field).to.equal('GodZilla');
      expect(errors.meta[1].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[1].meta.field).to.equal('King Kong');
    });

    it('should throw all errors on unknown and missing header', async function () {
      const input = `Column 1;GodZilla;
      The;;;;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

      const errors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(errors.meta).to.lengthOf(2);

      expect(errors.meta[0].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[0].meta.field).to.equal('Column 3');
      expect(errors.meta[1].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[1].meta.field).to.equal('GodZilla');
    });
  });

  context('When the file has different encoding', function () {
    const columns = [
      new CsvColumn({ property: 'firstName', name: 'Prénom', isRequired: true, checkEncoding: true }),
      new CsvColumn({ property: 'lastName', name: 'Nom' }),
    ];

    const input = `Prénom;Nom;
      Éçéà niño véga;The;
    `;

    it('should parse UTF-8 encoding', function () {
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);
      parser.parse(parser.getFileEncoding());
      expect(learnerSet.learners[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse win1252 encoding (CSV WIN/MSDOS)', function () {
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);
      parser.parse(parser.getFileEncoding());
      expect(learnerSet.learners[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse macintosh encoding', function () {
      const encodedInput = iconv.encode(input, 'macintosh');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);
      parser.parse(parser.getFileEncoding());
      expect(learnerSet.learners[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should throw an error if encoding not supported', async function () {
      const encodedInput = iconv.encode(input, 'utf16');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);
      const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(error.meta[0].code).to.equal('ENCODING_NOT_SUPPORTED');
    });
  });
});
