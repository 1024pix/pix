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
        headers: [
          {
            name: 'Nom apprenant',
            config: {
              validate: { type: 'string', required: true },
              property: 'lastName',
              reconcile: { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
            },
            required: true,
          },
          {
            name: 'Prénom apprenant',
            config: {
              validate: { type: 'string', required: true },
              property: 'firstName',
              reconcile: { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
            },
            required: true,
          },
          {
            name: 'catégorie',
            required: true,
            config: {
              displayable: {
                position: 2,
                name: IMPORT_KEY_FIELD.COMMON_DIVISION,
                filterable: { type: 'string' },
              },
              exportable: true,
              validate: { type: 'string', required: true },
            },
          },
          {
            name: 'Date de naissance',
            required: true,
            config: {
              validate: { type: 'date', format: 'YYYY-MM-DD', required: true },
              reconcile: { fieldId: 'reconcileField3', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 3 },
              displayable: { position: 1, name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, filterable: { type: 'string' } },
              exportable: true,
            },
          },
          { name: 'unicity key', required: true, validate: { type: 'string', required: true } },
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
      expect(organizationLearnerImportFormat.extraColumns).to.deep.members([
        { key: 'Date de naissance', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE },
        { key: 'catégorie', name: IMPORT_KEY_FIELD.COMMON_DIVISION },
      ]);
    });

    it('should return empty when displayableColumns is not defined', function () {
      organizationLearnerImportFormatPayload.config.headers = [
        {
          name: 'Nom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'lastName',
            reconcile: { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
          },
          required: true,
        },
        {
          name: 'Prénom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'firstName',
            reconcile: { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
          },
          required: true,
        },
      ];

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
        { name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 1 },
        { name: IMPORT_KEY_FIELD.COMMON_DIVISION, position: 2 },
      ]);
    });

    it('should return empty when filterableColumns is not defined', function () {
      organizationLearnerImportFormatPayload.config.headers = [
        {
          name: 'Nom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'lastName',
            reconcile: { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
          },
          required: true,
        },
        {
          name: 'Prénom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'firstName',
            reconcile: { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
          },
          required: true,
        },
      ];

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
        { name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, position: 1 },
        { name: IMPORT_KEY_FIELD.COMMON_DIVISION, position: 2 },
      ]);
    });

    it('should return empty when displayableColumns is not defined', function () {
      organizationLearnerImportFormatPayload.config.headers = [
        {
          name: 'Nom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'lastName',
            reconcile: { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
          },
          required: true,
        },
        {
          name: 'Prénom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'firstName',
            reconcile: { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
          },
          required: true,
        },
      ];

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
        IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
        IMPORT_KEY_FIELD.COMMON_DIVISION,
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
      organizationLearnerImportFormatPayload.config.headers = [
        {
          name: 'Nom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'lastName',
            reconcile: { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
          },
          required: true,
        },
        {
          name: 'Prénom apprenant',
          config: {
            validate: { type: 'string', required: true },
            property: 'firstName',
            reconcile: { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
          },
          required: true,
        },
      ];

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
        { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, type: 'string', position: 1 },
        { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, type: 'string', position: 2 },
        { fieldId: 'reconcileField3', name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE, type: 'date', position: 3 },
      ]);
    });
  });

  describe('#headersName', function () {
    it('should return headers fields', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.headersName).to.deep.equal([
        { name: 'Nom apprenant' },
        { name: 'Prénom apprenant' },
        { name: 'catégorie' },
        { name: 'Date de naissance' },
        { name: 'unicity key' },
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
        { name: 'Nom apprenant', property: 'lastName', required: true },
      ];

      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.exportableColumns).lengthOf(0);
    });
  });
});
