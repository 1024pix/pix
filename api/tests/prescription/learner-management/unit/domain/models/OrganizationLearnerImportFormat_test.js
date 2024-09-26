import { IMPORT_KEY_FIELD } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Models | OrganizationLearnerImportFormat', function () {
  let organizationLearnerImportFormatPayload;

  beforeEach(function () {
    organizationLearnerImportFormatPayload = {
      id: 777,
      name: 'GENERIC',
      fileType: 'csv',
      config: {
        acceptedEncoding: ['utf8'],
        unicityColumns: ['unicity key'],
        reconciliationMappingColumns: [
          { key: 4, fieldId: 'reconcileField3', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 3 },
          { key: 1, fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
          { key: 2, fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
        ],
        validationRules: {
          formats: [
            { key: 1, name: 'Nom apprenant', type: 'string', required: true },
            { key: 2, name: 'Prénom apprenant', type: 'string', required: true },
            { key: 3, name: 'catégorie', type: 'string', required: true },
            { key: 4, name: 'Date de naissance', type: 'date', format: 'YYYY-MM-DD', required: true },
            { key: 5, name: 'unicity key', type: 'string', required: true },
          ],
        },
        headers: [
          { key: 1, name: 'Nom apprenant', property: 'lastName', required: true },
          { key: 2, name: 'Prénom apprenant', property: 'firstName', required: true },
          { key: 3, name: 'catégorie', required: true, config: { exportable: true } },
          { key: 4, name: 'Date de naissance', required: true, config: { exportable: true } },
          { key: 5, name: 'unicity key', required: true },
        ],
        filterableColumns: [
          {
            key: 4,
            position: 2,
            name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
          },
          {
            key: 3,
            position: 1,
            name: IMPORT_KEY_FIELD.COMMON_DIVISION,
          },
        ],
        displayableColumns: [
          {
            key: 3,
            position: 2,
            name: IMPORT_KEY_FIELD.COMMON_DIVISION,
          },
          {
            key: 4,
            position: 1,
            name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
          },
        ],
      },
      createdAt: new Date('2024-01-01'),
      createdBy: 666,
    };
  });

  describe('#constructor', function () {
    it('should initialize valid object', function () {
      //when
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat({
        name: 'SAY_MY_NAME',
        config: { basic_config: 'toto' },
        fileType: 'csv',
      });
      // then
      expect(organizationLearnerImportFormat).to.deep.equal({
        name: 'SAY_MY_NAME',
        config: { basic_config: 'toto' },
        fileType: 'csv',
      });
    });

    context('Validation Cases', function () {
      it('returns an EntityValidator when missing fileType', function () {
        //when
        try {
          new OrganizationLearnerImportFormat({
            name: 'SAY_MY_NAME',
            config: { basic_config: 'toto' },
            fileType: 'incalif_file_type',
          });
        } catch (error) {
          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.be.equal('fileType');
        }
      });

      it('returns an EntityValidator when missing name', function () {
        //when
        try {
          new OrganizationLearnerImportFormat({
            config: { basic_config: 'toto' },
            fileType: 'csv',
          });
        } catch (error) {
          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.be.equal('name');
        }
      });

      it('returns an EntityValidator when missing config', function () {
        //when
        try {
          new OrganizationLearnerImportFormat({
            name: 'SAY_MY_NAME',
            fileType: 'csv',
          });
        } catch (error) {
          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.be.equal('config');
        }
      });

      it('returns multiple EntityValidator when missing multiple config', function () {
        //when
        try {
          new OrganizationLearnerImportFormat({
            fileType: 'csv',
          });
        } catch (error) {
          // then
          expect(error.invalidAttributes).to.be.lengthOf(2);
        }
      });
    });
  });

  describe('#extraColumns', function () {
    it('should return extra column to extract', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.extraColumns).to.deep.equal([
        { key: 'Date de naissance', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE },
        { key: 'catégorie', name: IMPORT_KEY_FIELD.COMMON_DIVISION },
      ]);
    });

    it('should return empty when displayableColumns is not defined', function () {
      delete organizationLearnerImportFormatPayload.config.displayableColumns;

      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.extraColumns).lengthOf(0);
    });
  });

  describe('#orderedFilterableColumns', function () {
    it('should return filters in right order', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.orderedFilterableColumns).to.deep.equal([
        { key: 3, name: IMPORT_KEY_FIELD.COMMON_DIVISION, position: 1 },
        { key: 4, name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 2 },
      ]);
    });

    it('should return empty when filterableColumns is not defined', function () {
      delete organizationLearnerImportFormatPayload.config.filterableColumns;

      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.orderedFilterableColumns).lengthOf(0);
    });
  });

  describe('#orderedDisplayabledColumns', function () {
    it('should return columns in right order for displayed', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.orderedDisplayabledColumns).to.deep.equal([
        { key: 4, name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 1 },
        { key: 3, name: IMPORT_KEY_FIELD.COMMON_DIVISION, position: 2 },
      ]);
    });

    it('should return empty when displayableColumns is not defined', function () {
      delete organizationLearnerImportFormatPayload.config.displayableColumns;

      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.orderedDisplayabledColumns).lengthOf(0);
    });
  });

  describe('#filtersToDisplay', function () {
    it('should return filters in right order for displayed', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.filtersToDisplay).to.deep.equal([
        IMPORT_KEY_FIELD.COMMON_DIVISION,
        IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
      ]);
    });
  });

  describe('#columnsToDisplay', function () {
    it('should return columns in right order for displayed', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.columnsToDisplay).to.deep.equal([
        IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
        IMPORT_KEY_FIELD.COMMON_DIVISION,
      ]);
    });

    it('should return empty when displayableColumns is not defined', function () {
      delete organizationLearnerImportFormatPayload.config.displayableColumns;

      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.columnsToDisplay).lengthOf(0);
    });
  });

  describe('#reconciliationFields', function () {
    it('should return reconcileFields', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.reconciliationFields).to.deep.equal([
        { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, type: 'string' },
        { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, type: 'string' },
        { fieldId: 'reconcileField3', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, type: 'date' },
      ]);
    });
  });

  describe('#headersFields', function () {
    it('should return headers fields', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.headersFields).to.deep.equal([
        { key: 1, name: 'Nom apprenant', property: 'lastName', required: true },
        { key: 2, name: 'Prénom apprenant', property: 'firstName', required: true },
        { key: 3, name: 'catégorie', required: true, config: { exportable: true } },
        { key: 4, name: 'Date de naissance', required: true, config: { exportable: true } },
        { key: 5, name: 'unicity key', required: true },
      ]);
    });
  });

  describe('#transformReconciliationData', function () {
    it('should return a reconciliation payload', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(
        organizationLearnerImportFormat.transformReconciliationData({
          reconcileField1: 'value1',
          reconcileField2: 'value2',
          reconcileField3: 'value3',
        }),
      ).to.deep.equal({
        lastName: 'value1',
        firstName: 'value2',
        attributes: {
          'Date de naissance': 'value3',
        },
      });
    });
  });

  describe('#exportableColumns', function () {
    it('should return exportable columns', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.exportableColumns).to.deep.equals([
        { columnName: 'catégorie' },
        { columnName: 'Date de naissance' },
      ]);
    });

    it('should return empty when there is no exportable columns', function () {
      organizationLearnerImportFormatPayload.config.headers = [
        { key: 1, name: 'Nom apprenant', property: 'lastName', required: true },
      ];

      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.exportableColumns).lengthOf(0);
    });
  });
});
