import {
  CommonOrganizationLearner,
  ImportOrganizationLearnerSet,
} from '../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnerSet.js';
import { VALIDATION_ERRORS } from '../../../../../../src/shared/domain/constants.js';
import { CsvImportError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Unit | Models | ImportOrganizationLearnerSet', function () {
  const organizationId = 123;
  const learnerAttributes = {
    prénom: 'Tomie',
    nom: 'Katana',
    "nom d'usage": 'Yolo',
    anniversaire: '34',
    group: 'Solo',
  };
  let importFormat;

  beforeEach(function () {
    importFormat = {
      config: {
        validationRules: {},
        headers: [
          {
            name: 'prénom',
            property: 'firstName',
          },
          {
            name: 'nom',
            property: 'lastName',
          },
          {
            name: 'anniversaire',
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
    it('should return an instance of ImportOrgaizationLearnerSet', function () {
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

      expect(learnerSet).to.be.instanceOf(ImportOrganizationLearnerSet);
    });
  });

  describe('#addLearner', function () {
    it('should add a learner', function () {
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

      learnerSet.addLearners([learnerAttributes]);

      expect(learnerSet.learners).to.lengthOf(1);
      expect(learnerSet.learners[0]).to.be.an.instanceOf(CommonOrganizationLearner);
      expect(learnerSet.learners).to.deep.equal([
        new CommonOrganizationLearner({
          firstName: 'Tomie',
          lastName: 'Katana',
          organizationId,
          "nom d'usage": 'Yolo',
          anniversaire: '34',
          group: 'Solo',
        }),
      ]);
    });

    it('should return multiple learners', function () {
      const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

      learnerSet.addLearners([learnerAttributes, learnerAttributes]);

      expect(learnerSet.learners).to.lengthOf(2);
    });

    describe('When has validation rules', function () {
      context('checkUnicityRule', function () {
        it('should throw unicity errors on one attribute', async function () {
          importFormat.config.validationRules = {
            unicity: ['group'],
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(learnerSet.addLearners, learnerSet)([learnerAttributes, learnerAttributes]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].meta.field).to.equal('group');
          expect(errors[0].meta.line).to.equal(3);
          expect(errors[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });

        it('should throw unicity errors on multiple attributes', async function () {
          importFormat.config.validationRules = {
            unicity: ['firstName', 'group'],
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(learnerSet.addLearners, learnerSet)([learnerAttributes, learnerAttributes]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].meta.field).to.equal('firstName-group');
          expect(errors[0].meta.line).to.equal(3);
          expect(errors[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });

        it('should not throw unicity errors when all unicity attributes are differents', async function () {
          importFormat.config.validationRules = {
            unicity: ['firstName', 'group'],
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const secondLearnerAttributes = { ...learnerAttributes, firstName: 'Tomie', group: 'cheese' };

          const response = learnerSet.addLearners([learnerAttributes, secondLearnerAttributes]);

          expect(response).to.not.throw;
        });
      });
      context('checkDateRule', function () {
        it('when the date respect the format, should not throw an error', async function () {
          importFormat.config.validationRules = {
            formats: [{ name: 'birthdate', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const response = learnerSet.addLearners([{ ...learnerAttributes, birthdate: '2026-03-06' }]);
          expect(response).to.not.throw;
        });

        it('should throw date error when the format is not respected', async function () {
          importFormat.config.validationRules = {
            formats: [{ name: 'anniversaire', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(learnerSet.addLearners, learnerSet)([learnerAttributes]);
          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[0].meta.field).to.equal('anniversaire');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal('YYYY-MM-DD');
        });

        it('should throw date error when the format is not possible', async function () {
          importFormat.config.validationRules = {
            formats: [{ name: 'anniversaire', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, anniversaire: '2026-53-46' }]);

          expect(errors).lengthOf(1);
          expect(errors[0]).instanceOf(CsvImportError);
          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[0].meta.field).to.equal('anniversaire');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal('YYYY-MM-DD');
        });
      });
      context('With several rules', function () {
        it('should throw all errors on multiple lines ', async function () {
          importFormat.config.validationRules = {
            unicity: ['prénom', 'group'],
            formats: [{ name: 'anniversaire', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          const secondLearnersAttributes = {
            prénom: 'Tomie',
            nom: 'Katana',
            anniversaire: '2002-04-01',
            group: 'Solo',
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([learnerAttributes, secondLearnersAttributes]);

          expect(errors).lengthOf(2);

          expect(errors[0].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[0].meta.field).to.equal('anniversaire');
          expect(errors[0].meta.line).to.equal(2);
          expect(errors[0].meta.acceptedFormat).to.equal('YYYY-MM-DD');

          expect(errors[1].code).to.equal(VALIDATION_ERRORS.PROPERTY_NOT_UNIQ);
          expect(errors[1].meta.field).to.equal('prénom-group');
          expect(errors[1].meta.line).to.equal(3);
        });
        it('should throw all errors on one line', async function () {
          importFormat.config.validationRules = {
            unicity: ['prénom', 'group'],
            formats: [{ name: 'anniversaire', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          const secondLearnersAttributes = {
            prénom: 'Tomie',
            nom: 'Katana',
            anniversaire: '2002',
            group: 'Solo',
          };

          const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

          const errors = await catchErr(
            learnerSet.addLearners,
            learnerSet,
          )([{ ...learnerAttributes, anniversaire: '2023-05-01' }, secondLearnersAttributes]);

          expect(errors).lengthOf(2);

          expect(errors[0].code).to.equal(VALIDATION_ERRORS.PROPERTY_NOT_UNIQ);
          expect(errors[0].meta.field).to.equal('prénom-group');
          expect(errors[0].meta.line).to.equal(3);

          expect(errors[1].code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
          expect(errors[1].meta.field).to.equal('anniversaire');
          expect(errors[1].meta.line).to.equal(3);
          expect(errors[1].meta.acceptedFormat).to.equal('YYYY-MM-DD');
        });
      });
    });

    describe('convertLearnerDates', function () {
      it('when there is one date config, should transform the date', async function () {
        importFormat.config.validationRules = {
          formats: [{ name: 'anniversaire', type: 'date', format: 'YYYY/MM/DD', required: true }],
        };

        const learnerSet = ImportOrganizationLearnerSet.buildSet({ organizationId, importFormat });

        learnerSet.addLearners([{ ...learnerAttributes, anniversaire: '2026/03/06' }]);
        expect(learnerSet.learners[0].attributes.anniversaire).to.equal('2026-03-06');
      });

      it('when there is several date configs, should transform all the dates', async function () {
        importFormat.config.validationRules = {
          formats: [
            { name: 'anniversaire', type: 'date', format: 'DD-MM-YYYY', required: true },
            { name: 'marriage', type: 'date', format: 'YYYY-DD-MM', required: true },
          ],
        };

        importFormat.config.headers.push({ name: 'marriage' });

        const learnerSet = new ImportOrganizationLearnerSet({
          organizationId,
          importFormat,
        });

        learnerSet.addLearners([{ ...learnerAttributes, anniversaire: '06-03-2010', marriage: '2027-09-06' }]);

        expect(learnerSet.learners[0].attributes.anniversaire).to.equal('2010-03-06');
        expect(learnerSet.learners[0].attributes.marriage).to.equal('2027-06-09');
      });
    });
  });
});
