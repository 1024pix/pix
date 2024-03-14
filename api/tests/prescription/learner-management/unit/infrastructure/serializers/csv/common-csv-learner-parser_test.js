import iconv from 'iconv-lite';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { CommonCsvLearerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/common-csv-learner-parser.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | CommonCsvLearerParser', function () {
  const organizationId = 123;

  context('when the header is correctly formed', function () {
    context('when there are lines', function () {
      const config = {
        headers: [
          {
            name: 'nom',
            property: 'firstName',
            isRequired: true,
          },
          {
            name: 'prénom',
            property: 'lastName',
            isRequired: false,
          },
        ],
        acceptedEncoding: ['utf8'],
      };

      it('returns a learnerSet with an organization learner for each line', function () {
        const input = `nom;prénom;
        Beatrix;The;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

        const call = () => parser.parse(parser.getFileEncoding());

        expect(call).to.not.throw();
      });
    });
  });

  context('When file does not match requirements', function () {
    const config = {
      headers: [
        {
          name: 'nom',
          property: 'firstName',
          isRequired: true,
        },
        {
          name: 'prénom',
          property: 'lastName',
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
      const input = `nom\\prénom\\
      Beatrix\\The\\`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      const error = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(error.meta[0].code).to.equal('ENCODING_NOT_SUPPORTED');
    });

    it('should throw all errors on missing header', async function () {
      const input = `prénom;
      The;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      const errors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(errors).instanceOf(AggregateImportError);
      expect(errors.meta).to.lengthOf(2);
      expect(errors.meta[0].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[0].meta.field).to.equal('nom');
      expect(errors.meta[1].code).to.equal('HEADER_REQUIRED');
      expect(errors.meta[1].meta.field).to.equal('GodZilla');
    });

    it('should throw all errors on unknown header', async function () {
      const input = `nom;Gidorah;King Kong;GodZilla;
      The;;;;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      const errors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

      expect(errors.meta).to.lengthOf(2);

      expect(errors.meta[0].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[0].meta.field).to.equal('Gidorah');
      expect(errors.meta[1].code).to.equal('HEADER_UNKNOWN');
      expect(errors.meta[1].meta.field).to.equal('King Kong');
    });

    it('should throw all errors on unknown and missing header', async function () {
      const input = `prénom;Gidorah;
      The;;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearerParser(encodedInput, organizationId, config);

      const errors = await catchErr(parser.parse, parser)(parser.getFileEncoding());

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
