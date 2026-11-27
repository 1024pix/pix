import { Readable } from 'node:stream';
import { setImmediate, setTimeout as timersSetTimeout } from 'node:timers/promises';

import { expect } from 'chai';
import iconv from 'iconv-lite';

import { GenericParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/generic-parser.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | Infrastructure | GenericParser', function () {
  context('buildParser', function () {
    it('returns an instance of GenericParser', function () {
      const input = `prénom
      Éçéà niño véga`;
      const encodedInput = iconv.encode(input, 'utf8');
      const importFormat = {
        config: {
          headers: [
            {
              name: 'nom',
              property: 'lastName',
              required: true,
            },
            {
              name: 'prénom',
              property: 'firstName',
              required: false,
            },
            {
              name: 'GodZilla',
              property: 'kaiju',
              required: true,
            },
          ],
          acceptedEncoding: ['utf8'],
        },
      };
      const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

      expect(parser).to.be.instanceOf(GenericParser);
    });
  });

  context('getEncoding', function () {
    const importFormat = {
      config: {
        headers: [
          {
            name: 'prénom',
            property: 'firstName',
            required: false,
            checkEncoding: true,
          },
        ],
        acceptedEncoding: ['utf8'],
      },
    };

    const input = `prénom
      Éçéà niño vé€g$êa‘£ë`;

    it('should throw an error if there is no acceptedEncoding', async function () {
      // given
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

      // when
      const error = await catchErr(parser.getEncoding, parser)();

      // then
      expect(error[0].code).to.equal('ENCODING_NOT_SUPPORTED');
    });

    it('should not throw an error if encoding is supported', async function () {
      // given
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

      // when
      const call = () => parser.getEncoding();
      // then
      expect(call).to.not.throw();
    });

    it('should not throw an error if encoding is included in multiple supported encoding', async function () {
      // given
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = GenericParser.buildParser({
        buffer: encodedInput,
        importFormat: {
          config: {
            headers: importFormat.config.headers,
            acceptedEncoding: ['iso-8859-1', 'utf8'],
          },
        },
      });

      // when
      const result = parser.getEncoding();
      // then
      expect(result).to.equal('utf8');
    });
  });

  context('parseStream', function () {
    const importFormat = {
      config: {
        headers: [
          { name: 'nom', property: 'lastName', required: true },
          { name: 'prénom', property: 'firstName', required: false },
          { name: 'GodZilla', property: 'kaiju', required: true },
        ],
        acceptedEncoding: ['utf8'],
      },
    };
    let parser;

    beforeEach(function () {
      parser = GenericParser.buildParser({ importFormat });
    });

    function buildStream(input, encoding = 'utf8', chunkSize = Infinity) {
      const buffer = iconv.encode(input, encoding);
      const chunks = [];
      for (let i = 0; i < buffer.length; i += Math.min(chunkSize, buffer.length)) {
        chunks.push(buffer.subarray(i, i + chunkSize));
      }
      return Readable.from(chunks);
    }

    it('should yield every line, one by one', async function () {
      // given
      const readableStream = buildStream(`nom;prénom;GodZilla
Beatrix;The;Éçéà
   ;;

King;Kong;ñ
`);

      // when
      const lines = await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

      // then
      expect(lines).to.deep.equal([
        { nom: 'Beatrix', prénom: 'The', GodZilla: 'Éçéà' },
        { nom: 'King', prénom: 'Kong', GodZilla: 'ñ' },
      ]);
    });

    it('should decode characters split between two chunks', async function () {
      // given
      const input = `nom;prénom;GodZilla\n${Array.from({ length: 30 }, () => 'Éçéà;ñ;€').join('\n')}`;
      const readableStream = buildStream(input, 'utf8', 151);

      // when
      const lines = await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

      // then
      expect(lines).to.have.lengthOf(30);
      expect(lines.every((line) => line.nom === 'Éçéà' && line.prénom === 'ñ' && line.GodZilla === '€')).to.be.true;
    });

    it('should decode the file with the given encoding', async function () {
      // given
      const readableStream = buildStream(`nom;prénom;GodZilla\nBéatrix;Théo;Ça`, 'win1252');

      // when
      const lines = await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'win1252' }));

      // then
      expect(lines).to.deep.equal([{ nom: 'Béatrix', prénom: 'Théo', GodZilla: 'Ça' }]);
    });

    it('should trim headers and ignore the BOM', async function () {
      // given
      const readableStream = buildStream(`\uFEFF nom ;prénom;GodZilla\nBeatrix;The;Zilla`);

      // when
      const lines = await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

      // then
      expect(lines).to.deep.equal([{ nom: 'Beatrix', prénom: 'The', GodZilla: 'Zilla' }]);
    });

    it('should keep the key of empty values', async function () {
      // given
      const readableStream = buildStream(`nom;prénom;GodZilla\nBeatrix;;Zilla`);

      // when
      const lines = await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

      // then
      expect(lines).to.deep.equal([{ nom: 'Beatrix', prénom: undefined, GodZilla: 'Zilla' }]);
      expect(Object.keys(lines[0])).to.have.lengthOf(3);
    });

    it('should accept unknown header', async function () {
      // given
      const readableStream = buildStream(`nom;Gidorah;King Kong;GodZilla\nThe;Best;Of;All`);

      // when
      const lines = await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

      // then
      expect(lines).to.deep.equal([{ nom: 'The', Gidorah: 'Best', 'King Kong': 'Of', GodZilla: 'All' }]);
    });

    it('should parse a file with many lines', async function () {
      // given
      const rows = 20000;
      async function* generate() {
        yield 'nom;prénom;GodZilla\n';
        for (let i = 0; i < rows; i++) yield `Nom${i};Prénom${i};Zilla\n`;
      }
      const readableStream = Readable.from(generate());

      // when
      const lines = await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

      // then
      expect(lines).to.have.lengthOf(rows);
      expect(lines[0]).to.deep.equal({ nom: 'Nom0', prénom: 'Prénom0', GodZilla: 'Zilla' });
      expect(lines.at(-1)).to.deep.equal({ nom: `Nom${rows - 1}`, prénom: `Prénom${rows - 1}`, GodZilla: 'Zilla' });
    });

    context('when file contains only headers', function () {
      it('should not throw if the file has correct headers', async function () {
        // given
        const readableStream = buildStream(`nom;prénom;GodZilla`);

        // when
        const lines = Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

        // then
        await expect(lines).to.eventually.deep.equal([]);
      });

      it('should throw if the file contains wrong headers', async function () {
        // given
        const readableStream = buildStream(`nom;prénom`);

        // when
        const lines = Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));

        // then
        await expect(lines).to.be.rejected;
      });
    });

    context('when the format is bad', function () {
      it('should throw BAD_CSV_FORMAT if the file is not csv', async function () {
        // given
        const readableStream = buildStream(`nom\\prénom\\
      Beatrix\\The\\`);

        // when
        const error = await catchErr(async () => {
          await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));
        })();

        // then

        expect(error).to.have.lengthOf(1);
        expect(error[0].code).to.equal('BAD_CSV_FORMAT');
      });

      it('should throw BAD_CSV_FORMAT if a line has more columns than headers', async function () {
        // given
        const readableStream = buildStream(`nom;prénom;GodZilla\nBeatrix;The;cheese;of;truth\nA;B;C\n`);

        // when
        const error = await catchErr(async () => {
          await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));
        })();

        // then
        expect(error).to.have.lengthOf(1);
        expect(error[0].code).to.equal('BAD_CSV_FORMAT');
      });

      it('should throw BAD_CSV_FORMAT if a line has less columns than headers', async function () {
        // given
        const readableStream = buildStream(`nom;GodZilla;prénom\nBeatrix;`);

        // when
        const error = await catchErr(async () => {
          await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));
        })();

        // then
        expect(error[0].code).to.equal('BAD_CSV_FORMAT');
      });

      it('should throw BAD_CSV_FORMAT if the file is empty', async function () {
        // given
        const readableStream = buildStream('');

        // when
        const error = await catchErr(async () => {
          await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));
        })();

        // then
        expect(error).to.have.lengthOf(1);
        expect(error[0].code).to.equal('BAD_CSV_FORMAT');
      });

      it('should stop reading the stream', async function () {
        // given
        const readableStream = buildStream(`nom;prénom;GodZilla\nBeatrix;The;cheese;of;truth\nA;B;C\n`);

        // when
        await catchErr(async () => {
          await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));
        })();

        // then
        expect(readableStream.destroyed).to.be.true;
      });
    });

    context('when headers are missing', function () {
      it('should throw all missing headers errors without yielding any line', async function () {
        // given
        const readableStream = buildStream(`prénom;nom2\nThe;Best`);
        const lines = [];

        // when
        const errors = await catchErr(async () => {
          for await (const line of parser.parseStream({ readableStream, encoding: 'utf8' })) lines.push(line);
        })();

        // then
        expect(errors).to.lengthOf(2);
        expect(errors[0].code).to.equal('HEADER_REQUIRED');
        expect(errors[0].meta.field).to.equal('nom');
        expect(errors[1].code).to.equal('HEADER_REQUIRED');
        expect(errors[1].meta.field).to.equal('GodZilla');
        expect(lines).to.be.empty;
      });

      it('should throw missing headers errors when the file has no line', async function () {
        // given
        const readableStream = buildStream(`prénom;nom`);

        // when
        const errors = await catchErr(async () => {
          await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));
        })();

        // then
        expect(errors).to.lengthOf(1);
        expect(errors[0].code).to.equal('HEADER_REQUIRED');
        expect(errors[0].meta.field).to.equal('GodZilla');
      });
    });

    context('when the consumer stops or is slow', function () {
      it('should destroy the stream when the consumer throws', async function () {
        // given
        const readableStream = buildStream(`nom;prénom;GodZilla\nBeatrix;The;Zilla\nA;B;C\nD;E;F\n`);

        // when
        const thrown = await catchErr(async () => {
          for await (const line of parser.parseStream({ readableStream, encoding: 'utf8' })) {
            throw new Error(`consumer failed on ${line.nom}`);
          }
        })();

        // then
        expect(thrown.message).to.equal('consumer failed on Beatrix');
        expect(readableStream.destroyed).to.be.true;
      });

      it('should destroy the stream when the consumer breaks', async function () {
        // given
        const readableStream = buildStream(`nom;prénom;GodZilla\n${'A;B;C\n'.repeat(1000)}`, 'utf8', 50);
        const lines = [];

        // when
        for await (const line of parser.parseStream({ readableStream, encoding: 'utf8' })) {
          lines.push(line);
          if (lines.length === 3) break;
        }
        await setImmediate();

        // then
        expect(lines).to.have.lengthOf(3);
        expect(readableStream.destroyed).to.be.true;
      });

      it('should not read the whole file while the consumer is stuck', async function () {
        // given
        const rows = 200000;
        let linesRead = 0;
        async function* generate() {
          yield 'nom;prénom;GodZilla\n';
          for (let i = 0; i < rows; i++) {
            linesRead++;
            yield `Nom${i};Prénom${i};Zilla\n`;
          }
        }

        // when
        const lines = parser.parseStream({ readableStream: Readable.from(generate()), encoding: 'utf8' });
        await lines.next();
        // the consumer is stuck on the first line: everything that can be read meanwhile is read
        await timersSetTimeout(300);
        await lines.return();

        // then
        // buffers of the streams hold a few thousands lines, but not the whole file
        expect(linesRead)
          .to.be.above(0)
          .and.below(rows / 10);
      });

      it('should yield every line in order when the consumer is slow', async function () {
        // given
        const rows = 30000;
        const input = `nom;prénom;GodZilla\n${Array.from({ length: rows }, (_, i) => `Nom${i};P;Z`).join('\n')}`;
        const readableStream = buildStream(input, 'utf8', 4096);
        const names = [];

        // when
        for await (const { nom } of parser.parseStream({ readableStream, encoding: 'utf8' })) {
          names.push(nom);
          if (names.length % 100 === 0) await setImmediate();
        }

        // then
        expect(names).to.deep.equal(Array.from({ length: rows }, (_, i) => `Nom${i}`));
      });
    });

    it('should throw the error of the readable stream', async function () {
      // given
      const error = new Error('S3 connection reset');
      async function* failing() {
        yield 'nom;prénom;GodZilla\nBeatrix;The;Zilla\n';
        throw error;
      }
      const readableStream = Readable.from(failing());

      // when
      const thrown = await catchErr(async () => {
        await Array.fromAsync(parser.parseStream({ readableStream, encoding: 'utf8' }));
      })();

      // then
      expect(thrown).to.equal(error);
    });
  });

  context('When file does not match requirements', function () {
    const importFormat = {
      config: {
        headers: [
          {
            name: 'nom',
            property: 'lastName',
            required: true,
          },
          {
            name: 'prénom',
            property: 'firstName',
            required: false,
          },
          {
            name: 'GodZilla',
            property: 'kaiju',
            required: true,
          },
        ],
        acceptedEncoding: ['utf8'],
      },
    };

    it('should throw an error if the file is not csv', async function () {
      // given
      const input = `nom\\prénom\\
      Beatrix\\The\\`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

      // when
      const error = await catchErr(parser.parse, parser)('utf8');

      // then
      expect(error[0].code).to.equal('BAD_CSV_FORMAT');
    });

    context('Error FieldMismatch', function () {
      it('should throw an error if the is more columns than headers', async function () {
        // given
        const input = `nom;prénom;GodZilla
      Beatrix;The;cheese;of;truth`;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });
        // when
        const error = await catchErr(parser.parse, parser)('utf8');

        // then
        expect(error[0].code).to.equal('BAD_CSV_FORMAT');
      });

      it('should throw an error if the is less columns than headers', async function () {
        // given
        const input = `nom;GodZilla;prénom
        Beatrix;`;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });
        // when
        const error = await catchErr(parser.parse, parser)('utf8');

        // then
        expect(error[0].code).to.equal('BAD_CSV_FORMAT');
      });
    });

    it('should throw all errors on missing header', async function () {
      // given
      const input = `prénom;
      The;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

      // when
      const errors = await catchErr(parser.parse, parser)('utf8');

      // then
      expect(errors).to.lengthOf(2);
      expect(errors[0].code).to.equal('HEADER_REQUIRED');
      expect(errors[0].meta.field).to.equal('nom');
      expect(errors[1].code).to.equal('HEADER_REQUIRED');
      expect(errors[1].meta.field).to.equal('GodZilla');
    });

    it('should accept unknown header', async function () {
      // given
      const input = `nom;Gidorah;King Kong;GodZilla
      The;Best;Of;All`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

      // when
      const result = parser.parse('utf8');

      // then
      expect(result).lengthOf(1);
      expect(result[0]).to.be.deep.equal({
        nom: 'The',
        Gidorah: 'Best',
        'King Kong': 'Of',
        GodZilla: 'All',
      });
    });
  });

  context('when the header is correctly formed', function () {
    let importFormat;

    beforeEach(function () {
      importFormat = {
        config: {
          headers: [
            {
              name: 'nom',
              property: 'lastName',
              required: true,
            },
            {
              name: 'prénom',
              property: 'firstName',
              required: false,
            },
          ],
          acceptedEncoding: ['utf8'],
        },
      };
    });

    context('when there are no lines', function () {
      it('should not throw on valid CSV', function () {
        // given
        const input = `nom;prénom`;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

        // when
        const call = () => parser.parse('utf8');
        // then
        expect(call).to.not.throw();
      });
    });
    context('when there are lines', function () {
      it('should not throw on valid CSV', function () {
        // given
        const input = `nom;prénom
        Beatrix;The
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

        // when
        const call = () => parser.parse('utf8');
        // then
        expect(call).to.not.throw();
      });

      it('should return CommonOrganizationLearner from CSV', function () {
        // given
        const input = `prénom;nom
        Godzilla;King of monsters
        `;

        const encodedInput = iconv.encode(input, 'utf8');
        const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

        // when
        const result = parser.parse('utf8');

        // then
        expect(result).lengthOf(1);
        expect(result[0]).to.be.deep.equal({
          prénom: 'Godzilla',
          nom: 'King of monsters',
        });
      });

      it('should trim headers', async function () {
        // given
        const input = ` prénom ;nom
        Godzilla;King of monsters
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = GenericParser.buildParser({ buffer: encodedInput, importFormat });

        // when
        const result = parser.parse('utf8');

        // then
        expect(result).to.lengthOf(1);
        expect(result[0]).to.be.deep.equal({
          nom: 'King of monsters',
          prénom: 'Godzilla',
        });
      });
    });
  });
});
