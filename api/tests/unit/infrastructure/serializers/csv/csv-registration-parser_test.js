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

describe('Unit | Infrastructure | CsvRegistrationParser', () => {
  const organizationId = 123;
  let registrationSet;

  beforeEach(() => {
    registrationSet = new FakeRegistrationSet();
  });

  context('when the header is correctly formed', () => {
    context('when there are lines', () => {
      const columns = [
        new CsvColumn({ name: 'col1', label: 'Column 1' }),
        new CsvColumn({ name: 'col2', label: 'Column 2' }),
      ];

      it('returns a HigherSchoolingRegistrationSet with a schooling registration for each line', () => {
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
    context('when there are different date formats', () => {
      const columns = [
        new CsvColumn({ name: 'col1', label: 'Column 1' }),
        new CsvColumn({ name: 'col2', label: 'Column 2', isDate: true }),
      ];

      it('should parse different date formats', () => {
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

    context('when there are a validation error', () => {
      const columns = [
        new CsvColumn({ name: 'ColumnName', label: 'ColumnLabel' }),
      ];

      let error;
      beforeEach(() => {
        registrationSet.addRegistration = function() { throw error; };
      });

      context('when error.why is min_length', () => {
        it('should parse different date formats', async () => {
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

          expect(parsingError.message).to.contain('Le champ “ColumnLabel” doit être d’au moins 12 caractères.');
        });
      });

      context('when error.why is max_length', () => {
        it('should parse different date formats', async () => {
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

          expect(parsingError.message).to.contain('Le champ “ColumnLabel” doit être inférieur à 8 caractères.');
        });
      });

      context('when error.why is required', () => {
        it('should parse different date formats', async () => {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'required';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.message).to.contain('Le champ “ColumnLabel” est obligatoire.');
        });
      });

      context('when error.why is bad_values', () => {
        it('should parse different date formats', async () => {
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

          expect(parsingError.message).to.contain('Le champ “ColumnLabel” doit être "value1 ou value2 ou value3"');
        });
      });

      context('when error.why is date_format', () => {
        it('should parse different date formats', async () => {
          error = new Error();
          error.key = 'ColumnName';
          error.why = 'date_format';

          const input = `ColumnLabel;
          Beatrix;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

          const parsingError = await catchErr(parser.parse, parser)();

          expect(parsingError.message).to.contain('Le champ “ColumnLabel” doit être au format jj/mm/aaaa.');
        });
      });

      it('should throw an error including line number', async () => {
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

        expect(parsingError.message).to.contain('Ligne 4 :');
      });
    });
  });

  context('When file does not match requirements', () => {
    const columns = [
      new CsvColumn({ name: 'col1', label: 'Column 1',  isRequired: true }),
      new CsvColumn({ name: 'col2', label: 'Column 2' }),
    ];

    it('should throw an error if the file is not csv', async () => {
      const input = `Column 1\\Column 2\\
      Beatrix\\The\\`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.equal('Le fichier doit être au format csv avec séparateur virgule ou point-virgule.');
    });

    it('should throw an error if a column is not recognized', async () => {
      const input = `Column 1;BAD Column 2;
        Beatrix;The;
        O-Ren;;
      `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.equal('Les entêtes de colonnes doivent être identiques à celle du modèle.');
    });

    it('should throw an error if a required column is missing', async () => {
      const input = `Column 2;
      The;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.equal('La colonne "Column 1" est obligatoire.');
    });
  });

  context('When the file has different encoding', () => {
    const columns = [
      new CsvColumn({ name: 'firstName', label: 'Prénom',  isRequired: true, checkEncoding: true }),
      new CsvColumn({ name: 'lastName', label: 'Nom' }),
    ];

    const input = `Prénom;Nom;
      Éçéà niño véga;The;
    `;

    it('should parse UTF-8 encoding', () => {
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      parser.parse();
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse win1252 encoding (CSV WIN/MSDOS)', () => {
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      parser.parse();
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse macintosh encoding', () => {
      const encodedInput = iconv.encode(input, 'macintosh');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      parser.parse();
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should throw an error if encoding not supported', () => {
      const encodedInput = iconv.encode(input, 'utf16');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns, registrationSet);
      expect(() => parser.parse()).to.throw('Encodage du fichier non supporté.');
    });
  });
});
