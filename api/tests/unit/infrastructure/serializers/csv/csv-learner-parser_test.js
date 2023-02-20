import iconv from 'iconv-lite';
import { sinon, expect, catchErr } from '../../../../test-helper';
import { CsvOrganizationLearnerParser } from '../../../../../lib/infrastructure/serializers/csv/csv-learner-parser';
import { CsvColumn } from '../../../../../lib/infrastructure/serializers/csv/csv-column';

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

      it('returns a SupOrganizationLearnerSet with an organization learner for each line', function () {
        const input = `Column 1;Column 2;
        Beatrix;The;
        O-Ren;;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

        parser.parse();

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

        parser.parse();

        expect(learnerSet.learners[0].col2).to.equal('2010-01-20');
        expect(learnerSet.learners[1].col2).to.equal('2010-01-20');
        expect(learnerSet.learners[2].col2).to.equal('2010-01-20');
      });
    });

    context('when there is a validation error', function () {
      const columns = [new CsvColumn({ property: 'property', name: 'ColumnLabel' })];

      let error;
      beforeEach(function () {
        learnerSet.addLearner = function () {
          throw error;
        };
      });

      context('when error.why is min_length', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'min_length';
          error.limit = 12;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_MIN_LENGTH');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 12 });
        });
      });

      context('when error.why is max_length', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'max_length';
          error.limit = 8;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_MAX_LENGTH');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 8 });
        });
      });

      context('when error.why is required', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'required';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_REQUIRED');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is bad_values', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'bad_values';
          error.valids = ['value1', 'value2', 'value3'];

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_BAD_VALUES');
          expect(parsingError.meta).to.deep.equal({
            line: 2,
            field: 'ColumnLabel',
            valids: ['value1', 'value2', 'value3'],
          });
        });
      });

      context('when error.length is bad_values', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'length';
          error.limit = 2;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_LENGTH');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 2 });
        });
      });

      context('when error.why is date_format', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'date_format';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_DATE_FORMAT');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is not_a_date', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'not_a_date';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_DATE_FORMAT');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is email_format', function () {
        it('throws a parsing error', async function () {
          error = new Error();
          error.key = 'property';
          error.why = 'email_format';

          const input = `ColumnLabel;
          boeuf_bourguignon@chef..com;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_EMAIL_FORMAT');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      it('should throw an error including line number', async function () {
        error = new Error();
        error.key = 'property';
        error.why = 'required';

        learnerSet.addLearner = sinon.stub().onThirdCall().throws(error);
        const input = `ColumnLabel;
        Beatrix1;
        Beatrix2;
        Beatrix3;
        `;

        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

        const parsingError = await catchErr(parser.parse, parser)();

        expect(parsingError.meta.line).to.equal(4);
      });
    });
  });

  context('When file does not match requirements', function () {
    const columns = [
      new CsvColumn({ property: 'col1', name: 'Column 1', isRequired: true }),
      new CsvColumn({ property: 'col2', name: 'Column 2' }),
    ];

    it('should throw an error if the file is not csv', async function () {
      const input = `Column 1\\Column 2\\
      Beatrix\\The\\`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('BAD_CSV_FORMAT');
    });

    it('should throw an error if a column is not recognized', async function () {
      const input = `Column 1;BAD Column 2;
        Beatrix;The;
        O-Ren;;
      `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('HEADER_UNKNOWN');
    });

    it('should throw an error if a required column is missing', async function () {
      const input = `Column 2;
      The;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('HEADER_REQUIRED');
      expect(error.meta.field).to.equal('Column 1');
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
      parser.parse();
      expect(learnerSet.learners[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse win1252 encoding (CSV WIN/MSDOS)', function () {
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);
      parser.parse();
      expect(learnerSet.learners[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse macintosh encoding', function () {
      const encodedInput = iconv.encode(input, 'macintosh');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);
      parser.parse();
      expect(learnerSet.learners[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should throw an error if encoding not supported', async function () {
      const encodedInput = iconv.encode(input, 'utf16');
      const parser = new CsvOrganizationLearnerParser(encodedInput, organizationId, columns, learnerSet);
      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
    });
  });
});
