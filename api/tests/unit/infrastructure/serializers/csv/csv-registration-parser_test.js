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
        const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);

        parser.parse({
          registrationSet,
          onParseLineError: sinon.stub(),
        });

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
        const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);

        parser.parse({
          registrationSet,
          onParseLineError: sinon.stub(),
        });

        expect(registrationSet.registrations[0].col2).to.equal('2010-01-20');
        expect(registrationSet.registrations[1].col2).to.equal('2010-01-20');
        expect(registrationSet.registrations[2].col2).to.equal('2010-01-20');
      });
    });

    context('when there are a validation error', () => {
      const columns = [
        new CsvColumn({ name: 'col1', label: 'Column 1' }),
        new CsvColumn({ name: 'col2', label: 'Column 2' }),
      ];
      
      it('should parse different date formats', () => {
        const input = `Column 1;Column 2;
        O-Ren;2010-01-20;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);

        const onParseLineError = sinon.stub();
        const error = new Error('error');
        registrationSet.addRegistration = () => {
          throw error;
        };

        parser.parse({ registrationSet, onParseLineError });

        expect(onParseLineError).to.calledOnceWithExactly(error, 0);
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
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);

      const error = await catchErr(parser.parse, parser)({
        registrationSet,
        onParseLineError: sinon.stub(),
      });

      expect(error.message).to.equal('Le fichier doit être au format csv avec séparateur virgule ou point-virgule.');
    });

    it('should throw an error if a column is not recognized', async () => {
      const input = `Column 1;BAD Column 2;
        Beatrix;The;
        O-Ren;;
      `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);

      const error = await catchErr(parser.parse, parser)({
        registrationSet,
        onParseLineError: sinon.stub(),
      });

      expect(error.message).to.equal('Les entêtes de colonnes doivent être identiques à celle du modèle.');
    });

    it('should throw an error if a required column is missing', async () => {
      const input = `Column 2;
      The;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);

      const error = await catchErr(parser.parse, parser)({
        registrationSet,
        onParseLineError: sinon.stub(),
      });

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
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);
      parser.parse({
        registrationSet,
        onParseLineError: sinon.stub(),
      });
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse win1252 encoding (CSV WIN/MSDOS)', () => {
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);
      parser.parse({
        registrationSet,
        onParseLineError: sinon.stub(),
      });
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should parse macintosh encoding', () => {
      const encodedInput = iconv.encode(input, 'macintosh');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);
      parser.parse({
        registrationSet,
        onParseLineError: sinon.stub(),
      });
      expect(registrationSet.registrations[0].firstName).to.equal('Éçéà niño véga');
    });

    it('should throw an error if encoding not supported', () => {
      const encodedInput = iconv.encode(input, 'utf16');
      const parser = new CsvRegistrationParser(encodedInput, organizationId, columns);
      expect(() => parser.parse({
        registrationSet,
        onParseLineError: sinon.stub(),
      })).to.throw('Encodage du fichier non supporté.');
    });
  });
});
