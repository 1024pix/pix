import iconv from 'iconv-lite';

import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { CommonOrganizationLearner } from '../../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearnerSet.js';
import { CommonCsvLearnerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/common-csv-learner-parser.js';
import { VALIDATION_ERRORS } from '../../../../../../../src/shared/domain/constants.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | CommonCsvLearnerParser', function () {
  const organizationId = 123;

  context('findEncoding', function () {
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
      const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);

      // when
      const error = await catchErr(parser.findEncoding, parser)();

      // then
      expect(error.meta[0].code).to.equal('ENCODING_NOT_SUPPORTED');
    });

    it('should not throw an error if encoding is not in acceptedEncoding config', async function () {
      // given
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);

      // when
      const call = () => parser.findEncoding();
      // then
      expect(call).to.not.throw();
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
      const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
      parser.findEncoding();
      // when
      const error = await catchErr(parser.parse, parser)();

      // then
      expect(error.meta[0].code).to.equal('BAD_CSV_FORMAT');
    });

    it('should throw an error if the is more columns than headers', async function () {
      // given
      const input = `nom;prénom;GodZilla
      Beatrix;The;cheese;of;truth`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
      parser.findEncoding();
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
      const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);

      parser.findEncoding();
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
      const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);

      parser.findEncoding();
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
      const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
      parser.findEncoding();

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

  context('when the header is correctly formed', function () {
    context('when there are lines', function () {
      let config;
      beforeEach(function () {
        config = {
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
      });

      it('should not throw on valid CSV', function () {
        // given
        const input = `nom;prénom;
        Beatrix;The;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);

        parser.findEncoding();
        // when
        const call = () => parser.parse();
        // then
        expect(call).to.not.throw();
      });

      it('should return CommonOrganizationLearner from CSV', function () {
        // given
        const input = `prénom;nom;
        Godzilla;King of monsters;
        `;

        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);

        parser.findEncoding();
        // when
        const learners = parser.parse();

        // then
        expect(learners).lengthOf(1);
        expect(learners[0]).instanceOf(CommonOrganizationLearner);
      });

      it('should return desired attributes from CSV', function () {
        // given
        const input = `prénom;nom;
        Godzilla;King of monsters;
        PikaChu;Pokemon Gotta Catch'em ALL;
        `;

        const expectedOutput = [
          { firstName: 'Godzilla', lastName: 'King of monsters', organizationId, attributes: {} },
          { firstName: 'PikaChu', lastName: "Pokemon Gotta Catch'em ALL", organizationId, attributes: {} },
        ];

        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);

        parser.findEncoding();
        // when
        const learners = parser.parse();

        // then
        expect(learners).deep.equal(expectedOutput);
      });

      it('should return in attributes everything that is not in config file', function () {
        // given
        config.headers.push({
          name: 'classe',
          isRequired: false,
        });
        const input = `prénom;nom;classe;
        Godzilla; King of monsters;3emeB;
        PikaChu;Pokemon Gotta Catch'em ALL;6emeD;
        `;

        const expectedOutput = [
          { firstName: 'Godzilla', lastName: 'King of monsters', organizationId, attributes: { classe: '3emeB' } },
          {
            firstName: 'PikaChu',
            lastName: "Pokemon Gotta Catch'em ALL",
            organizationId,
            attributes: { classe: '6emeD' },
          },
        ];
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
        parser.findEncoding();

        // when
        const learners = parser.parse();

        // then
        expect(learners).deep.equal(expectedOutput);
      });

      context('Error case', function () {
        it('should throw unicity error', async function () {
          // given
          config.headers.push({
            name: 'classe',
            isRequired: true,
          });

          config.validationRules = {
            unicity: ['classe'],
          };

          const input = `prénom;nom;classe;
          The;Superman;4èmeB;
          The;Batman;4èmeB`;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
          parser.findEncoding();

          // when
          const errors = await catchErr(parser.parse, parser)();

          // then
          expect(errors.meta).to.lengthOf(1);
          expect(errors.meta[0].code).to.equal(VALIDATION_ERRORS.PROPERTY_NOT_UNIQ);
          expect(errors.meta[0].meta.field).to.equal('classe');
          expect(errors.meta[0].meta.line).to.equal(3);
        });

        it('should throw date field format error', async function () {
          // given
          config.headers.push({
            name: 'date de naissance',
            isRequired: true,
          });

          config.validationRules = {
            formats: [
              {
                name: 'date de naissance',
                type: 'date',
                format: 'YYYY-MM-DD',
                required: true,
              },
            ],
          };
          const input = `prénom;nom;date de naissance;
          The;Superman;3 juillet 1990`;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
          parser.findEncoding();

          // when
          const errors = await catchErr(parser.parse, parser)();

          // then
          expect(errors.meta).to.lengthOf(1);
          expect(errors.meta[0].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors.meta[0].meta.field).to.equal('date de naissance');
          expect(errors.meta[0].meta.line).to.equal(2);
          expect(errors.meta[0].meta.acceptedFormat).to.equal('YYYY-MM-DD');
        });

        it('should throw required field error', async function () {
          // given
          config.headers.push({
            name: 'date de naissance',
            isRequired: true,
          });

          config.validationRules = {
            formats: [
              {
                name: 'date de naissance',
                type: 'date',
                format: 'YYYY-MM-DD',
                required: true,
              },
            ],
          };
          const input = `prénom;nom;date de naissance;
          The;Superman;;`;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
          parser.findEncoding();

          // when
          const errors = await catchErr(parser.parse, parser)();

          // then
          expect(errors.meta).to.lengthOf(1);
          expect(errors.meta[0].code).to.equal(VALIDATION_ERRORS.FIELD_REQUIRED);
          expect(errors.meta[0].meta.field).to.equal('date de naissance');
          expect(errors.meta[0].meta.line).to.equal(2);
        });

        context('Should return several validation errors', function () {
          it('when there are 2 learners', async function () {
            // given
            config.headers.push({
              name: 'date de naissance',
              isRequired: true,
            });

            config.validationRules = {
              unicity: ['nom', 'prénom'],
              formats: [
                {
                  name: 'date de naissance',
                  type: 'date',
                  format: 'YYYY-MM-DD',
                  required: true,
                },
              ],
            };
            const input = `prénom;nom;date de naissance;
          The;Superman;;
          The;Superman;1999-09-01;`;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
            parser.setEncoding();

            // when
            const errors = await catchErr(parser.parse, parser)();

            // then
            expect(errors.meta).to.lengthOf(2);
            expect(errors.meta.map((error) => error.code)).to.deep.equal([
              VALIDATION_ERRORS.FIELD_REQUIRED,
              VALIDATION_ERRORS.PROPERTY_NOT_UNIQ,
            ]);
          });

          it('when there is only one learner', async function () {
            // given
            config.headers.push(
              {
                name: 'date de naissance',
                isRequired: true,
              },
              {
                name: 'date de mariage',
              },
            );

            config.validationRules = {
              formats: [
                {
                  name: 'date de naissance',
                  type: 'date',
                  format: 'YYYY-MM-DD',
                  required: true,
                },
                {
                  name: 'date de mariage',
                  type: 'date',
                  format: 'YYYY-MM-DD',
                },
              ],
            };
            const input = `prénom;nom;date de naissance;date de mariage
            The;Superman;;09-09-1999`;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new CommonCsvLearnerParser(encodedInput, organizationId, config);
            parser.setEncoding();

            // when
            const errors = await catchErr(parser.parse, parser)();

            // then
            expect(errors.meta).to.lengthOf(2);
            expect(errors.meta.map((error) => error.code)).to.deep.equal([
              VALIDATION_ERRORS.FIELD_REQUIRED,
              VALIDATION_ERRORS.FIELD_DATE_FORMAT,
            ]);
          });
        });
      });
    });
  });
});
