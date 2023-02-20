import iconv from 'iconv-lite';
import { expect, catchErr } from '../../../../test-helper';
import { CsvParser } from '../../../../../lib/infrastructure/serializers/csv/csv-parser';
import { CsvColumn } from '../../../../../lib/infrastructure/serializers/csv/csv-column';

describe('Unit | Infrastructure | CsvParser', function () {
  context('The header is correctly formed', function () {
    context('There are lines', function () {
      it('returns an Array of POJO with two key', async function () {
        const header = {
          columns: [
            new CsvColumn({ property: 'col1', name: 'Column 1' }),
            new CsvColumn({ property: 'col2', name: 'Column 2' }),
          ],
        };

        const input = `Column 1;Column 2
        John;Mc Lane`;
        const parser = new CsvParser(input, header);
        const [result] = parser.parse();

        expect(result.col1).to.equal('John');
        expect(result.col2).to.equal('Mc Lane');
      });

      it('returns an Array of POJO with one key', async function () {
        const header = {
          columns: [new CsvColumn({ property: 'col1', name: 'Column 1' })],
        };
        const input = `Column 1
        GodZilla
        Gidora`;
        const parser = new CsvParser(input, header);

        const [result1, result2] = parser.parse();

        expect(result1.col1).to.equal('GodZilla');
        expect(result2.col1).to.equal('Gidora');
      });
    });
  });

  context('File does not match requirements', function () {
    let header;
    beforeEach(function () {
      header = {
        columns: [
          new CsvColumn({ property: 'col1', name: 'Column 1', isRequired: true }),
          new CsvColumn({ property: 'col2', name: 'Column 2' }),
          new CsvColumn({ property: 'col3', name: 'Column 3' }),
        ],
      };
    });

    it('Throw an error if the file is not csv', async function () {
      const input = `Column 1;Column 2;Column 3
      Beatrix\\The\\Poo`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvParser(encodedInput, header);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('BAD_CSV_FORMAT');
    });

    it('Throw an error if a column is not recognized', async function () {
      const input = `Column 1;BAD Column 2;Column 3
        Beatrix;The;
        O-Ren;;
      `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvParser(encodedInput, header);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('HEADER_UNKNOWN');
    });

    it('Throw an error if a required column is missing', async function () {
      const input = `Column 2;Column 3
      The;Poo`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvParser(encodedInput, header);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('HEADER_REQUIRED');
      expect(error.meta.field).to.equal('Column 1');
    });
  });

  context('The file has different encoding', function () {
    let header, input;
    beforeEach(function () {
      header = {
        columns: [
          new CsvColumn({ property: 'firstName', name: 'Prénom', isRequired: true, checkEncoding: true }),
          new CsvColumn({ property: 'lastName', name: 'Nom' }),
        ],
      };
      input = `Prénom;Nom
      Éçéà niño véga;The
    `;
    });

    it('Parse UTF-8 encoding', function () {
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CsvParser(encodedInput, header);
      const [result] = parser.parse();
      expect(result.firstName).to.equal('Éçéà niño véga');
    });

    it('Parse win1252 encoding (CSV WIN/MSDOS)', function () {
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = new CsvParser(encodedInput, header);
      const [result] = parser.parse();
      expect(result.firstName).to.equal('Éçéà niño véga');
    });

    it('Parse macintosh encoding', function () {
      const encodedInput = iconv.encode(input, 'macintosh');
      const parser = new CsvParser(encodedInput, header);
      const [result] = parser.parse();
      expect(result.firstName).to.equal('Éçéà niño véga');
    });

    it('Throw an error if encoding not supported', async function () {
      const encodedInput = iconv.encode(input, 'utf16');
      const parser = new CsvParser(encodedInput, header);
      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
    });
  });
});
