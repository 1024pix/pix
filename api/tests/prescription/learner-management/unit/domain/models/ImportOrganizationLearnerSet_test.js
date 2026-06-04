import { CommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearner.js';
import { ImportOrganizationLearnerSet } from '../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnerSet.js';
import { VALIDATION_ERRORS } from '../../../../../../src/shared/domain/constants.js';
import { CsvImportError, ImportLearnerConfigurationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Models | ImportOrganizationLearnerSet', function () {
  const organizationId = 123;
  const learnerAttributes = {
    prénom: 'Tomie',
    nom: 'Katana',
    "nom d'usage": 'Yolo',
    group: 'Solo',
  };
  let importFormat;

  beforeEach(function () {
    importFormat = {
      config: {
        unicityColumns: ['prénom'],
        headers: [
          {
            name: 'prénom',
            config: { property: 'firstName' },
          },
          {
            name: 'nom',
            config: { property: 'lastName' },
          },
          {
            name: 'group',
          },
          {
            name: "nom d'usage",
          },
        ],
      },
    };
  });

  describe('buildSet', function () {
    it('should return an instance of ImportOrganizationLearnerSet', function () {
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

      expect(learnerSet).to.be.instanceOf(ImportOrganizationLearnerSet);
    });
  });

  describe('#addLearner', function () {
    describe('create learner context', function () {
      it('should add a learner', function () {
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        learnerSet.addLearners([learnerAttributes]);

        const learners = learnerSet.learners;

        expect(learners.list).to.lengthOf(1);
        expect(learners.list[0]).to.be.an.instanceOf(CommonOrganizationLearner);
        expect(learners.list).to.deep.equal([
          new CommonOrganizationLearner({
            firstName: 'Tomie',
            lastName: 'Katana',
            organizationId,
            "nom d'usage": 'Yolo',
            group: 'Solo',
          }),
        ]);
      });

      it('should add a learner once if there is duplicate lines', async function () {
        // given
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        // when
        learnerSet.addLearners([learnerAttributes, learnerAttributes]);

        //then
        expect(learnerSet.learners.list).lengthOf(1);
        expect(learnerSet.learners.list[0]).to.be.an.instanceOf(CommonOrganizationLearner);
        expect(learnerSet.learners.list).to.deep.equal([
          new CommonOrganizationLearner({
            firstName: 'Tomie',
            lastName: 'Katana',
            organizationId,
            "nom d'usage": 'Yolo',
            group: 'Solo',
          }),
        ]);
      });

      it('should add a learner with previous configuration', function () {
        const importFormat = {
          config: {
            unicityColumns: ['prénom'],
            headers: [
              {
                name: 'prénom',
                config: { property: 'firstName' },
              },
              {
                name: 'nom',
                config: { property: 'lastName' },
              },
              {
                name: 'category',
                config: { mappingColumn: 'group', mappingValues: { Solo: 'PreviousMappedValue_SOLO' } },
              },
              {
                name: 'TonNomCommun',
                config: { mappingColumn: "nom d'usage" },
              },
            ],
          },
        };

        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        const newLearnerAttributes = {
          prénom: 'Tomie',
          nom: 'Katana',
          TonNomCommun: 'Yolo',
          category: 'Solo',
        };

        learnerSet.addLearners([newLearnerAttributes]);

        const learners = learnerSet.learners;

        expect(learners.list).to.lengthOf(1);
        expect(learners.list[0]).to.be.an.instanceOf(CommonOrganizationLearner);
        expect(learners.list).to.deep.equal([
          new CommonOrganizationLearner({
            firstName: 'Tomie',
            lastName: 'Katana',
            organizationId,
            "nom d'usage": 'Yolo',
            group: 'PreviousMappedValue_SOLO',
          }),
        ]);
      });

      it('should return multiple learners', function () {
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        const learnerAttributes2 = {
          prénom: 'Mieto',
          nom: 'Nataka',
          "nom d'usage": 'Yolo',
          group: 'Solo',
        };
        learnerSet.addLearners([learnerAttributes, learnerAttributes2]);

        const learners = learnerSet.learners;

        expect(learners.list).to.lengthOf(2);
      });

      it('should return null for an attribute that is an empty string', function () {
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        learnerSet.addLearners([{ ...learnerAttributes, group: '' }]);

        expect(learnerSet.learners.list[0].attributes.group).to.be.null;
      });
    });

    describe('update learner context', function () {
      it('return learner to update', function () {
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        learnerSet.addLearners([learnerAttributes]);

        const learnerFromDB1 = new CommonOrganizationLearner({
          id: 666,
          userId: 24,
          firstName: 'Tomie',
          lastName: 'Katana',
          "nom d'usage": 'YoYo',
          group: 'Solo',
          organizationId,
        });

        learnerSet.setExistingLearners([learnerFromDB1]);

        const learners = learnerSet.learners;

        expect(learners.list).lengthOf(1);
      });

      it('updates existing learner into previous config', function () {
        const importFormat = {
          config: {
            unicityColumns: ['prénom'],
            headers: [
              {
                name: 'prénom',
                config: { property: 'firstName' },
              },
              {
                name: 'nom',
                config: { property: 'lastName' },
              },
              {
                name: 'category',
                config: { mappingColumn: 'group', mappingValues: { Solo: 'PreviousMappedValue_SOLO' } },
              },
              {
                name: 'TonNomCommun',
                config: { mappingColumn: "nom d'usage" },
              },
            ],
          },
        };

        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        const newLearnerAttributes = {
          prénom: 'Tomie',
          nom: 'Katana',
          TonNomCommun: 'Yalalala',
          category: 'Sola',
        };

        learnerSet.addLearners([newLearnerAttributes]);

        const learnerFromDB1 = new CommonOrganizationLearner({
          id: 666,
          userId: 24,
          firstName: 'Tomie',
          lastName: 'Katana',
          "nom d'usage": 'YoYo',
          group: 'Solo',
          organizationId,
        });

        learnerSet.setExistingLearners([learnerFromDB1]);

        const learners = learnerSet.learners;

        expect(learners.list).to.lengthOf(1);
        expect(learners.list[0]).to.be.an.instanceOf(CommonOrganizationLearner);
        expect(learners.list).to.deep.equal([
          new CommonOrganizationLearner({
            firstName: 'Tomie',
            lastName: 'Katana',
            id: 666,
            userId: 24,
            organizationId,
            "nom d'usage": 'Yalalala',
            group: 'Sola',
          }),
        ]);
      });

      it('return distinct list of learner to create or update', function () {
        importFormat.config.unicityColumns = ['prénom', 'group'];
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        const learnerAttributes2 = {
          prénom: 'Edgar',
          nom: 'Paslatugène',
          "nom d'usage": 'Edou',
          group: 'Solo',
        };
        learnerSet.addLearners([learnerAttributes, learnerAttributes2]);

        const learnerFromDB = new CommonOrganizationLearner({
          id: 777,
          userId: 42,
          firstName: 'Edgar',
          lastName: 'làsaymieux',
          "nom d'usage": 'Ed',
          group: 'Solo',
          organizationId,
        });

        learnerSet.setExistingLearners([learnerFromDB]);

        const learners = learnerSet.learners;

        expect(learners.list).to.deep.equals([
          {
            firstName: 'Tomie',
            lastName: 'Katana',
            organizationId,
            attributes: {
              "nom d'usage": 'Yolo',
              group: 'Solo',
            },
          },
          {
            id: 777,
            userId: 42,
            firstName: 'Edgar',
            lastName: 'Paslatugène',
            organizationId,
            attributes: {
              "nom d'usage": 'Edou',
              group: 'Solo',
            },
          },
        ]);
        expect(learners.existinglearnerIds).to.deep.equals([777]);
      });

      it('should default existingLearners to empty array when setExistingLearners is called without argument', function () {
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        learnerSet.addLearners([learnerAttributes]);
        learnerSet.setExistingLearners();

        expect(learnerSet.learners.existinglearnerIds).to.be.empty;
      });
    });

    describe('When has validation rules', function () {
      context('when missing lastName or firstName', function () {
        it('should throw an error when there is no firstName property', async function () {
          importFormat = {
            config: {
              unicityColumns: ['nom'],
              headers: [
                {
                  name: 'prénom',
                },
                {
                  name: 'nom',
                  config: { property: 'lastName' },
                },
              ],
            },
          };

          const errors = await catchErr(ImportOrganizationLearnerSet.buildSet)({ organizationId, importFormat });

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(ImportLearnerConfigurationError);
          expect(errors[0].message).equal('Missing firstName configuration');
          expect(errors[0].code).equal(VALIDATION_ERRORS.FIRSTNAME_PROPERTY_REQUIRED);
        });

        it('should throw an error when there is no lastName property', async function () {
          importFormat = {
            config: {
              unicityColumns: ['nom'],
              headers: [
                {
                  name: 'prénom',
                  config: { property: 'firstName' },
                },
                {
                  name: 'nom',
                },
              ],
            },
          };

          const errors = await catchErr(ImportOrganizationLearnerSet.buildSet)({ organizationId, importFormat });

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(ImportLearnerConfigurationError);
          expect(errors[0].message).equal('Missing lastName configuration');
          expect(errors[0].code).equal(VALIDATION_ERRORS.LASTNAME_PROPERTY_REQUIRED);
        });

        it('should throw 2 errors when there is no lastName and firstname property', async function () {
          importFormat = {
            config: {
              unicityColumns: ['nom'],
              headers: [
                {
                  name: 'prénom',
                },
                {
                  name: 'nom',
                },
              ],
            },
          };

          const errors = await catchErr(ImportOrganizationLearnerSet.buildSet)({ organizationId, importFormat });

          expect(errors).lengthOf(2);
          expect(errors[0]).instanceOf(ImportLearnerConfigurationError);
          expect(errors[0].message).equal('Missing firstName configuration');
          expect(errors[0].code).equal(VALIDATION_ERRORS.FIRSTNAME_PROPERTY_REQUIRED);
          expect(errors[1].message).equal('Missing lastName configuration');
          expect(errors[1].code).equal(VALIDATION_ERRORS.LASTNAME_PROPERTY_REQUIRED);
        });
      });

      context('checkUnicityRule', function () {
        it('should throw an error when no unicity rules is given', async function () {
          importFormat = {
            config: {
              headers: [
                {
                  name: 'prénom',
                  config: { property: 'firstName' },
                },
                {
                  name: 'nom',
                  config: { property: 'lastName' },
                },
              ],
            },
          };

          const errors = await catchErr(ImportOrganizationLearnerSet.buildSet)({ organizationId, importFormat });

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(ImportLearnerConfigurationError);
          expect(errors[0].message).equal('Missing unicity configuration');
          expect(errors[0].code).equal(VALIDATION_ERRORS.UNICITY_COLUMNS_REQUIRED);
        });

        it('should throw an error when unicity rules is empty', async function () {
          importFormat.config.unicityColumns = [];

          const errors = await catchErr(ImportOrganizationLearnerSet.buildSet)({ organizationId, importFormat });

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(ImportLearnerConfigurationError);
          expect(errors[0].message).equal('Missing unicity configuration');
          expect(errors[0].code).equal(VALIDATION_ERRORS.UNICITY_COLUMNS_REQUIRED);
        });

        it('should throw unicity errors if learner has same unicity value but different attributes', async function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([learnerAttributes, { ...learnerAttributes, nom: 'Katnis' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].meta.field).to.equal('prénom');
          expect(errors[0].meta.line).to.equal(3);
          expect(errors[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });

        it('should not throw unicity errors when all unicity attributes are differents', async function () {
          importFormat.config.unicityColumns = ['prénom', 'group'];

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const secondLearnerAttributes = { ...learnerAttributes, group: 'cheese' };

          expect(() => learnerSet.addLearners([learnerAttributes, secondLearnerAttributes])).to.not.throw();
        });

        it('should falsely detect duplicates when column values contain the separator "-" (known limitation)', async function () {
          importFormat.config.unicityColumns = ['prénom', 'group'];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const learner1 = { ...learnerAttributes, prénom: 'a-b', group: 'c' };
          const learner2 = { ...learnerAttributes, prénom: 'a', group: 'b-c' };

          const errors = await catchErr(learnerSet.addLearners, learnerSet)([learner1, learner2]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.PROPERTY_NOT_UNIQ);
        });
      });

      context('checkDateRule', function () {
        beforeEach(function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            {
              name: 'birthdate',
              config: { validate: { type: 'date', format: 'YYYY-MM-DD', required: true } },
            },
          ];
        });

        it('when the date respect the format, should not throw an error', async function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() => learnerSet.addLearners([{ ...learnerAttributes, birthdate: '2026-03-06' }])).to.not.throw();
        });

        it('should throw date error when the format is not respected', async function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, birthdate: '01-2026-12' }]);
          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[0].meta.field).to.equal('birthdate');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal('YYYY-MM-DD');
        });

        it('should throw date error when the format is not possible', async function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, birthdate: '2026-53-46' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[0].meta.field).to.equal('birthdate');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal('YYYY-MM-DD');
        });

        it('should throw a field_required error when a required field is missing', async function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(learnerSet.addLearners, learnerSet)([{ ...learnerAttributes }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_REQUIRED);
          expect(errors[0].meta.field).to.equal('birthdate');
          expect(errors[0].meta.line).to.equal(2);
        });
      });

      context('When there are expectedValues', function () {
        it('when the value corresponds to the expectedValues, should not throw an error', async function () {
          importFormat.config.headers = [...importFormat.config.headers, { name: 'cycle' }];
          importFormat.config.validationRules = {
            formats: [{ name: 'cycle', type: 'string', expectedValues: ['Cycle III'], required: true }],
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() => learnerSet.addLearners([{ ...learnerAttributes, cycle: 'Cycle III' }])).to.not.throw();
        });

        it('when the value DOES NOT correspond to the expectedValues, should throw an error', async function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'Cycle', config: { validate: { type: 'string', expectedValues: ['Cycle III'], required: true } } },
            {
              name: 'Niveau',
              config: { validate: { type: 'string', expectedValues: ['CM1', 'CM2'], required: true } },
            },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, Cycle: 'cycle ii', Niveau: 'cM1' }]);

          expect(errors).lengthOf(2);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_BAD_VALUES);
          expect(errors[0].meta.field).to.equal('Cycle');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.valids).to.deep.equal(['Cycle III']);
          expect(errors[1].code).to.equal(VALIDATION_ERRORS.FIELD_BAD_VALUES);
          expect(errors[1].meta.field).to.equal('Niveau');
          expect(errors[1].meta.line).to.equal(2);
          expect(errors[1].meta.valids).to.deep.equal(['CM1', 'CM2']);
        });
      });

      context('checkMinMaxRule', function () {
        it('when the value is above the min, should not throw an error', function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'code', config: { validate: { type: 'string', min: 2, required: true } } },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() => learnerSet.addLearners([{ ...learnerAttributes, code: 'ABC' }])).to.not.throw();
        });

        it('when the value is below the min, should throw a FIELD_STRING_MIN error', async function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'code', config: { validate: { type: 'string', min: 3, required: true } } },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(learnerSet.addLearners, learnerSet)([{ ...learnerAttributes, code: 'AB' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_STRING_MIN);
          expect(errors[0].meta.field).to.equal('code');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal(3);
        });

        it('when the value is below the max, should not throw an error', function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'code', config: { validate: { type: 'string', max: 5, required: true } } },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() => learnerSet.addLearners([{ ...learnerAttributes, code: 'ABC' }])).to.not.throw();
        });

        it('when the value exceeds the max, should throw a FIELD_STRING_MAX error', async function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'code', config: { validate: { type: 'string', max: 3, required: true } } },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(learnerSet.addLearners, learnerSet)([{ ...learnerAttributes, code: 'ABCDE' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_STRING_MAX);
          expect(errors[0].meta.field).to.equal('code');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal(3);
        });
      });

      context('checkLengthRule', function () {
        it('when the value has the correct length, should not throw an error', function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'codePays', config: { validate: { type: 'string', length: 5, required: true } } },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() => learnerSet.addLearners([{ ...learnerAttributes, codePays: '99100' }])).to.not.throw();
        });

        it('when the value does not have the correct length, should throw a FIELD_STRING_LENGTH error', async function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'codePays', config: { validate: { type: 'string', length: 5, required: true } } },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, codePays: '991' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_STRING_LENGTH);
          expect(errors[0].meta.field).to.equal('codePays');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal(5);
        });
      });

      context('checkRegexpRule', function () {
        it('when the value matches the regexp, should not throw an error', function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            {
              name: 'codePays',
              config: { validate: { type: 'string', regexp: '/9{2}[1-5]{1}[0-9]{2}/', required: true } },
            },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() => learnerSet.addLearners([{ ...learnerAttributes, codePays: '99100' }])).to.not.throw();
        });

        it('when the value does not match the regexp, should throw a FIELD_STRING_PATTERN error', async function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            {
              name: 'codePays',
              config: { validate: { type: 'string', regexp: '/9{2}[1-5]{1}[0-9]{2}/', required: true } },
            },
          ];
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, codePays: 'ABCDE' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_STRING_PATTERN);
          expect(errors[0].meta.field).to.equal('codePays');
          expect(errors[0].meta.line).to.equal(2);
        });
      });

      context('checkConditionalRule', function () {
        beforeEach(function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            { name: 'codePays', config: { validate: { type: 'string', required: true } } },
            {
              name: 'codeCommune',
              config: {
                validate: {
                  type: 'string',
                  required: false,
                  conditional: {
                    when: 'codePays',
                    is: '99100',
                    then: { required: true, length: 5 },
                    otherwise: { required: false, max: 255 },
                  },
                },
              },
            },
          ];
        });

        it('when the condition matches and the then-required field is present and valid, should not throw', function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() =>
            learnerSet.addLearners([{ ...learnerAttributes, codePays: '99100', codeCommune: '75056' }]),
          ).to.not.throw();
        });

        it('when the condition does not match and codeCommune is absent, should not throw', function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          expect(() =>
            learnerSet.addLearners([{ ...learnerAttributes, codePays: '99200', codeCommune: undefined }]),
          ).to.not.throw();
        });

        it('when the condition matches and the then-required field is absent, should throw FIELD_REQUIRED', async function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, codePays: '99100', codeCommune: undefined }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_REQUIRED);
          expect(errors[0].meta.field).to.equal('codeCommune');
          expect(errors[0].meta.line).to.equal(2);
        });

        it('when the condition matches and the then-required field fails length, should throw FIELD_STRING_LENGTH', async function () {
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, codePays: '99100', codeCommune: '750' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_STRING_LENGTH);
          expect(errors[0].meta.field).to.equal('codeCommune');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal(5);
        });

        it('when the condition matches and the value fails the regexp, should throw FIELD_STRING_PATTERN', async function () {
          importFormat.config.headers = importFormat.config.headers.map((header) => {
            if (header.name !== 'codeCommune') return header;
            return {
              ...header,
              config: {
                validate: {
                  type: 'string',
                  required: false,
                  conditional: {
                    when: 'codePays',
                    is: '99100',
                    then: { required: true, length: 5, regexp: '/[0-9]{5}/' },
                    otherwise: { required: false, max: 255 },
                  },
                },
              },
            };
          });
          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, codePays: '99100', codeCommune: 'ABCDE' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_STRING_PATTERN);
          expect(errors[0].meta.field).to.equal('codeCommune');
          expect(errors[0].meta.line).to.equal(2);
        });
      });

      context('With several rules', function () {
        it('should throw all errors on multiple lines ', async function () {
          importFormat.config.headers = [
            ...importFormat.config.headers,
            {
              name: 'birthdate',
              config: { validate: { type: 'date', format: 'YYYY-MM-DD', required: true } },
            },
          ];
          importFormat.config.unicityColumns = ['prénom', 'group'];

          const secondLearnersAttributes = {
            prénom: 'Tomie',
            nom: 'Katana',
            birthdate: '2002-04-01',
            group: 'Solo',
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, birthdate: '34' }, secondLearnersAttributes]);

          expect(errors).lengthOf(2);

          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[0].meta.field).to.equal('birthdate');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal('YYYY-MM-DD');

          expect(errors[1].code).to.equal(VALIDATION_ERRORS.PROPERTY_NOT_UNIQ);
          expect(errors[1].meta.field).to.equal('prénom-group');
          expect(errors[1].meta.line).to.equal(3);
        });

        it('should throw all errors on one line', async function () {
          importFormat.config.unicityColumns = ['prénom', 'group'];
          importFormat.config.headers = [
            ...importFormat.config.headers,
            {
              name: 'birthdate',
              config: { validate: { type: 'date', format: 'YYYY-MM-DD', required: true } },
            },
          ];

          const secondLearnersAttributes = {
            prénom: 'Tomie',
            nom: 'Katana',
            birthdate: '2002',
            group: 'Solo',
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, birthdate: '2023-05-01' }, secondLearnersAttributes]);

          expect(errors).lengthOf(2);

          expect(errors[0].code).to.equal(VALIDATION_ERRORS.PROPERTY_NOT_UNIQ);
          expect(errors[0].meta.field).to.equal('prénom-group');
          expect(errors[0].meta.line).to.equal(3);

          expect(errors[1].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[1].meta.field).to.equal('birthdate');
          expect(errors[1].meta.line).to.equal(3);
          expect(errors[1].meta.acceptedFormat).to.equal('YYYY-MM-DD');
        });
      });
    });

    describe('convertLearnerDates', function () {
      it('when there is one date config, should transform the date', async function () {
        importFormat.config.headers = [
          ...importFormat.config.headers,
          {
            name: 'birthdate',
            config: { validate: { type: 'date', format: 'YYYY/DD/MM', required: true } },
          },
        ];

        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        learnerSet.addLearners([{ ...learnerAttributes, birthdate: '2026/03/06' }]);

        const learners = learnerSet.learners;

        expect(learners.list[0].attributes.birthdate).to.equal('2026-06-03');
      });

      it('when there is several date configs, should transform all the dates', async function () {
        importFormat.config.headers = [
          ...importFormat.config.headers,
          {
            name: 'birthdate',
            config: { validate: { type: 'date', format: 'DD-MM-YYYY', required: true } },
          },
          {
            name: 'marriage',
            config: { validate: { type: 'date', format: 'YYYY-DD-MM', required: true } },
          },
        ];

        importFormat.config.headers.push({ name: 'marriage' });

        const learnerSet = new ImportOrganizationLearnerSet({
          organizationId,
          importFormat,
        });

        learnerSet.addLearners([{ ...learnerAttributes, birthdate: '06-03-2010', marriage: '2027-09-06' }]);

        const learners = learnerSet.learners;

        expect(learners.list[0].attributes.birthdate).to.equal('2010-03-06');
        expect(learners.list[0].attributes.marriage).to.equal('2027-06-09');
      });
    });

    context('edge cases', function () {
      it('should do nothing and not throw when called with an empty array', function () {
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        expect(() => learnerSet.addLearners([])).to.not.throw();
        expect(learnerSet.learners.list).to.be.empty;
      });

      it('should accumulate learners across multiple addLearners calls', function () {
        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });
        const learner2 = { ...learnerAttributes, prénom: 'Mieto', nom: 'Nataka' };

        learnerSet.addLearners([learnerAttributes]);
        learnerSet.addLearners([learner2]);

        expect(learnerSet.learners.list).to.have.lengthOf(2);
      });
    });
  });

  describe('learners getter', function () {
    it('should return empty list and existinglearnerIds before any addLearners call', function () {
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

      expect(learnerSet.learners.list).to.be.empty;
      expect(learnerSet.learners.existinglearnerIds).to.be.empty;
    });
  });

  describe('#filtersAvailableValues', function () {
    it('should return an empty array when no header is filterable', function () {
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });
      learnerSet.addLearners([learnerAttributes]);

      expect(learnerSet.filtersAvailableValues).to.deep.equal([]);
    });

    it('should not return values for a filterable header with a type other than "list"', function () {
      importFormat.config.headers = [
        ...importFormat.config.headers,
        {
          name: 'group',
          config: {
            displayable: { position: 1, name: 'division', filterable: { type: 'string' } },
          },
        },
      ];
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });
      learnerSet.addLearners([{ ...learnerAttributes, group: 'A' }]);

      expect(learnerSet.filtersAvailableValues).to.deep.equal([]);
    });

    it('should return unique values for each filterable list attribute', function () {
      importFormat.config.headers = [
        ...importFormat.config.headers,
        {
          name: 'group',
          config: {
            displayable: { position: 1, name: 'division', filterable: { type: 'list' } },
          },
        },
      ];
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });
      learnerSet.addLearners([
        { ...learnerAttributes, group: 'A' },
        { ...learnerAttributes, prénom: 'Mieto', group: 'B' },
        { ...learnerAttributes, prénom: 'Taro', group: 'A' },
      ]);

      expect(learnerSet.filtersAvailableValues).to.deep.equal([
        { organizationId: 123, attributeName: 'division', values: ['A', 'B'] },
      ]);
    });

    it('should return values for each filterable list attribute independently', function () {
      importFormat.config.headers = [
        ...importFormat.config.headers,
        {
          name: 'group',
          config: {
            displayable: { position: 1, name: 'division', filterable: { type: 'list' } },
          },
        },
        {
          name: 'status',
          config: {
            displayable: { position: 2, name: 'statut', filterable: { type: 'list' } },
          },
        },
      ];
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });
      learnerSet.addLearners([
        { ...learnerAttributes, group: 'A', status: 'active' },
        { ...learnerAttributes, prénom: 'Mieto', group: 'B', status: 'active' },
        { ...learnerAttributes, prénom: 'Taro', group: 'A', status: 'inactive' },
      ]);

      expect(learnerSet.filtersAvailableValues).to.deep.equal([
        { organizationId: 123, attributeName: 'division', values: ['A', 'B'] },
        { organizationId: 123, attributeName: 'statut', values: ['active', 'inactive'] },
      ]);
    });

    it('should use mappingColumn as attributeName when defined', function () {
      importFormat.config.headers = [
        ...importFormat.config.headers,
        {
          name: 'CATEGORY',
          config: {
            mappingColumn: 'catégorie',
            displayable: { position: 1, name: 'division', filterable: { type: 'list' } },
          },
        },
      ];
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });
      learnerSet.addLearners([{ ...learnerAttributes, CATEGORY: 'Solo' }]);

      expect(learnerSet.filtersAvailableValues).to.deep.equal([
        { organizationId: 123, attributeName: 'division', values: ['Solo'] },
      ]);
    });

    it('should use property as attributeName and read from learner directly when config.property is defined', function () {
      importFormat.config.headers = [
        {
          name: 'prénom',
          config: {
            property: 'firstName',
            displayable: { position: 1, name: 'Prénom', filterable: { type: 'list' } },
          },
        },
        { name: 'nom', config: { property: 'lastName' } },
      ];
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });
      learnerSet.addLearners([
        { prénom: 'Tomie', nom: 'Katana' },
        { prénom: 'Mieto', nom: 'Nataka' },
      ]);

      expect(learnerSet.filtersAvailableValues).to.deep.equal([
        { organizationId: 123, attributeName: 'Prénom', values: ['Tomie', 'Mieto'] },
      ]);
    });
  });
});
