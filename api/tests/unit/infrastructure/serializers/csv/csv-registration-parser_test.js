const iconv = require('iconv-lite');
const { sinon, expect, catchErr } = require('../../../../test-helper');
const { CsvRegistrationParser, CsvColumn } = require('../../../../../lib/infrastructure/serializers/csv/csv-registration-parser');

class FakeRegistrationSet {
  constructor() {
    this.registrations = [];
  }
  addRegistration(registration) {
    this.registrations.push(registration);
  }
}

describe('Unit | Infrastructure | CsvRegistrationParser', function() {
  const organizationId = 123;
  let registrationSet;

  beforeEach(function() {
    registrationSet = new FakeRegistrationSet();
  });

  context('when the header is correctly formed', function() {
    context('when there are lines', function() {
      const columns = [
        new CsvColumn({ name: 'col1', label: 'Column 1' }),
        new CsvColumn({ name: 'col2', label: 'Column 2' }),
      ];

      it('returns a HigherSchoolingRegistrationSet with a schooling registration for each line', function() {
        const input = `Column 1;Column 2;
        Beatrix;The;
        O-Ren;;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

        parser.parse();

        expect(registrationSet.registrations).to.have.lengthOf(2);
      });
    });
    context('when there are different date formats', function() {
      const columns = [
        new CsvColumn({ name: 'col1', label: 'Column 1' }),
        new CsvColumn({ name: 'col2', label: 'Column 2', isDate: true }),
      ];

      it('throws a parsing error', function() {
        const input = `Column 1;Column 2;
        O-Ren;2010-01-20;
        O-Ren;20/01/2010;
        O-Ren;20/01/10;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

        parser.parse();

        expect(registrationSet.registrations[0].col2).to.equal('2010-01-20');
        expect(registrationSet.registrations[1].col2).to.equal('2010-01-20');
        expect(registrationSet.registrations[2].col2).to.equal('2010-01-20');
      });
    });

    context('when there is a validation error', function() {
      const columns = [
        new CsvColumn({ name: 'ColumnName', label: 'ColumnLabel' }),
      ];

      let error;
      beforeEach(function() {
        registrationSet.addRegistration = function() { throw error; };
      });

      context('when error.why is min_length', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'min_length';
          error.limit = 12;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_MIN_LENGTH');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 12 });
        });
      });

      context('when error.why is max_length', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'max_length';
          error.limit = 8;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_MAX_LENGTH');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 8 });
        });
      });

      context('when error.why is required', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'required';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_REQUIRED');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is bad_values', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'bad_values';
          error.valids = ['value1', 'value2', 'value3'];

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_BAD_VALUES');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel', valids: ['value1', 'value2', 'value3'] });
        });
      });

      context('when error.length is bad_values', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'length';
          error.limit = 2;

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_LENGTH');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel', limit: 2 });
        });
      });

      context('when error.why is date_format', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'date_format';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_DATE_FORMAT');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is not_a_date', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'not_a_date';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_DATE_FORMAT');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      context('when error.why is email_format', function() {
        it('throws a parsing error', async function() {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'email_format';

          const input = `ColumnLabel;
          boeuf_bourguignon@chef..com;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.code).to.equal('FIELD_EMAIL_FORMAT');
          expect(parsingError.meta).to.deep.equal({ line: 2, field: 'ColumnLabel' });
        });
      });

      it('should throw an error including line number', async function() {
        error = new Error();
        error.key = 'ColumnName';
        error.why = 'required';

        registrationSet.addRegistration = sinon.stub().onThirdCall().throws(error);
        const input = `ColumnLabel;
        Beatrix1;
        Beatrix2;
        Beatrix3;
        `;

        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

        const parsingError = await catchErr(parser.parse, parser)();

        expect(parsingError.meta.line).to.equal(4);
      });
    });
  });

  context('When file does not match requirements', function() {
    const columns = [
      new CsvColumn({ name: 'col1', label: 'Column 1', isRequired: true }),
      new CsvColumn({ name: 'col2', label: 'Column 2' }),
    ];

    it('should throw an error if the file is not csv', async function() {
      const input = `Column 1\\Column 2\\
      Beatrix\\The\\`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('BAD_CSV_FORMAT');
    });

    it('should throw an error if a column is not recognized', async function() {
      const input = `Column 1;BAD Column 2;
        Beatrix;The;
        O-Ren;;
      `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('HEADER_UNKNOWN');
    });

    it('should throw an error if a required column is missing', async function() {
      const input = `Column 2;
      The;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('HEADER_REQUIRED');
      expect(error.meta.field).to.equal('Column 1');
    });
  });

  context('When the file has different encoding', function() {
    const columns = [
      new CsvColumn({ name: 'firstName', label: 'Prénom', isRequired: true, checkEncoding: true }),
      new CsvColumn({ name: 'lastName', label: 'Nom' }),
    ];

    const input = `Prénom;Nom;
      Éçéà niño véga;The;
    `;

    it('should parse UTF-8 encoding', function() {
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      parser.parse();
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse win1252 encoding (CSV WIN/MSDOS)', function() {
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      parser.parse();
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse macintosh encoding', function() {
      const encodedInput = iconv.encode(input, 'macintosh');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      parser.parse();
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should throw an error if encoding not supported', async function() {
      const encodedInput = iconv.encode(input, 'utf16');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
    });
  });
});
