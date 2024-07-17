import iconv from 'iconv-lite';

import { CommonCsvLearnerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/common-csv-learner-parser.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | CommonCsvLearnerParser', function () {
  context('buildParser', function () {
    it('returns an instance of CommonCsvLearnerParser', function () {
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
      const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

      expect(parser).to.be.instanceOf(CommonCsvLearnerParser);
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
      const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

      // when
      const error = await catchErr(parser.getEncoding, parser)();

      // then
      expect(error[0].code).to.equal('ENCODING_NOT_SUPPORTED');
    });

    it('should not throw an error if encoding is supported', async function () {
      // given
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

      // when
      const call = () => parser.getEncoding();
      // then
      expect(call).to.not.throw();
    });
    it('should not throw an error if encoding is included in multiple supported encoding', async function () {
      // given
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = CommonCsvLearnerParser.buildParser({
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
      const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

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
        const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });
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
        const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });
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
      const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

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
      const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

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
    context('when there are lines', function () {
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

      it('should not throw on valid CSV', function () {
        // given
        const input = `nom;prénom
        Beatrix;The
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

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
        const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

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
        const parser = CommonCsvLearnerParser.buildParser({ buffer: encodedInput, importFormat });

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
