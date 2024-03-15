import iconv from 'iconv-lite';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { CommonCsvLearerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/common-csv-learner-parser.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | CommonCsvLearerParser', function () {
  const organizationId = 123;

  context('setEncoding', function () {
    const config = {
      headers: [
        {
          name: 'prénom',
          property: 'firstName',
          isRequired: false,
          checkEncoding: true,
        },
      ],
      acceptedEncoding: ['utf8'],
    };

    const input = `prénom;
      Éçéà niño véga;`;

    it('should throw an error if there is no acceptedEncoding', async function () {
      // given
      const encodedInput = iconv.encode(input, 'win1252');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      // when
      const error = await catchErr(parser.setEncoding, parser)();

      // then
      expect(error.meta[0].code).to.equal('ENCODING_NOT_SUPPORTED');
    });

    it('should not throw an error if encoding is not in acceptedEncoding config', async function () {
      // given
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      // when
      const call = () => parser.setEncoding();
      // then
      expect(call).to.not.throw();
    });
  });

  context('when the header is correctly formed', function () {
    context('when there are lines', function () {
      const config = {
        headers: [
          {
            name: 'nom',
            property: 'lastName',
            isRequired: true,
          },
          {
            name: 'prénom',
            property: 'firstName',
            isRequired: false,
          },
        ],
        acceptedEncoding: ['utf8'],
      };

      it('should not throw on valid CSV', function () {
        // given
        const input = `nom;prénom;
        Beatrix;The;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

        parser.setEncoding();
        // when
        const call = () => parser.parse();
        // then
        expect(call).to.not.throw();
      });
    });
  });

  context('When file does not match requirements', function () {
    const config = {
      headers: [
        {
          name: 'nom',
          property: 'lastName',
          isRequired: true,
        },
        {
          name: 'prénom',
          property: 'firstName',
          isRequired: false,
        },
        {
          name: 'GodZilla',
          property: 'kaiju',
          isRequired: true,
        },
      ],
      acceptedEncoding: ['utf8'],
    };

    it('should throw an error if the file is not csv', async function () {
      // given
      const input = `nom\\prénom\\
      Beatrix\\The\\`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);
      parser.setEncoding();
      // when
      const error = await catchErr(parser.parse, parser)();

      // then
      expect(error.meta[0].code).to.equal('BAD_CSV_FORMAT');
    });

    it('should throw all errors on missing header', async function () {
      // given
      const input = `prénom;
      The;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      parser.setEncoding();
      // when
      const errors = await catchErr(parser.parse, parser)();

      // then
      expect(errors).instanceOf(AggregateImportError);
      expect(errors.meta).to.lengthOf(2);
      expect(errors.meta[0].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[0].meta.field).to.equal('nom');
      expect(errors.meta[1].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[1].meta.field).to.equal('GodZilla');
    });

    it('should throw all errors on unknown header', async function () {
      // given
      const input = `nom;Gidorah;King Kong;GodZilla;
      The;;;;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      parser.setEncoding();
      // when
      const errors = await catchErr(parser.parse, parser)();

      // then
      expect(errors.meta).to.lengthOf(2);

      expect(errors.meta[0].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[0].meta.field).to.equal('Gidorah');
      expect(errors.meta[1].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[1].meta.field).to.equal('King Kong');
    });

    it('should throw all errors on unknown and missing header', async function () {
      // given
      const input = `prénom;Gidorah;
      The;;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);
      parser.setEncoding();

      // when
      const errors = await catchErr(parser.parse, parser)();

      // then
      expect(errors.meta).to.lengthOf(3);

      expect(errors.meta[0].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[0].meta.field).to.equal('nom');
      expect(errors.meta[1].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[1].meta.field).to.equal('GodZilla');
      expect(errors.meta[2].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[2].meta.field).to.equal('Gidorah');
    });
  });
});
