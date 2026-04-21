import {
  ANONYMIZATION_RULE,
  IMPORT_KEY_FIELD,
} from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';

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
            name: 'CATEGORY',
            required: true,
            config: {
              mappingColumn: 'catégorie',
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
        id: 123,
        name: 'SAY_MY_NAME',
        config: { basic_config: 'toto' },
        fileType: 'csv',
        createdAt: new Date('2025-01-01'),
        createdBy: 12,
      });
      // then
      expect(organizationLearnerImportFormat).to.deep.equal({
        id: 123,
        name: 'SAY_MY_NAME',
        config: { basic_config: 'toto' },
        fileType: 'csv',
        createdBy: 12,
        createdAt: new Date('2025-01-01'),
      });
    });

    context('Validation Cases', function () {
      it('returns an EntityValidator when missing fileType', function () {
        //when
        try {
          new OrganizationLearnerImportFormat({
            id: 123,
            name: 'SAY_MY_NAME',
            config: { basic_config: 'toto' },
            fileType: 'incalif_file_type',
            createdAt: new Date('2025-01-01'),
            createdBy: 12,
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
            id: 123,
            config: { basic_config: 'toto' },
            fileType: 'csv',
            createdAt: new Date('2025-01-01'),
            createdBy: 12,
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
            id: 123,
            name: 'SAY_MY_NAME',
            fileType: 'csv',
            createdAt: new Date('2025-01-01'),
            createdBy: 12,
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
            id: 123,
            fileType: 'csv',
            createdAt: new Date('2025-01-01'),
            createdBy: 12,
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

  describe('#orderedDisplayableColumns', function () {
    it('should return displayable columns in right order', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.orderedDisplayableColumns).to.deep.equal([
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
      expect(organizationLearnerImportFormat.orderedDisplayableColumns).lengthOf(0);
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
        { name: 'CATEGORY' },
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

  describe('#anonymizeAttributes', function () {
    let importFormat;

    beforeEach(function () {
      importFormat = new OrganizationLearnerImportFormat({
        name: 'TEST',
        fileType: 'csv',
        config: {
          unicityColumns: ['Identifiant'],
          headers: [
            { name: 'Identifiant', config: { anonymize: ANONYMIZATION_RULE.CLEAR } },
            { name: 'Date de naissance', config: { anonymize: ANONYMIZATION_RULE.GENERALIZE_DATE } },
            { name: 'Niveau', config: { anonymize: ANONYMIZATION_RULE.KEEP } },
            { name: 'Cycle' },
          ],
        },
        createdAt: new Date(),
        createdBy: 1,
      });
    });

    it('should return null when attributes is null', function () {
      expect(importFormat.anonymizeAttributes(null)).to.be.null;
    });

    it('should delete key for CLEAR rule', function () {
      const result = importFormat.anonymizeAttributes({ Identifiant: 'ABC123' });
      expect(result.Identifiant).to.be.undefined;
    });

    it('should generalize date to January 1st for GENERALIZE_DATE rule', function () {
      const result = importFormat.anonymizeAttributes({ 'Date de naissance': '2005-10-03' });
      expect(result['Date de naissance']).to.equal('2005-01-01');
    });

    it('should return null for GENERALIZE_DATE rule when value is null', function () {
      const result = importFormat.anonymizeAttributes({ 'Date de naissance': null });
      expect(result['Date de naissance']).to.be.null;
    });

    it('should leave value unchanged for KEEP rule', function () {
      const result = importFormat.anonymizeAttributes({ Niveau: '3ème' });
      expect(result.Niveau).to.equal('3ème');
    });

    it('should leave value unchanged when no anonymize rule is defined (defaults to KEEP)', function () {
      const result = importFormat.anonymizeAttributes({ Cycle: 'cycle3' });
      expect(result.Cycle).to.equal('cycle3');
    });

    it('should use mappingColumn as the key when defined', function () {
      const formatWithMapping = new OrganizationLearnerImportFormat({
        name: 'TEST_MAPPING',
        fileType: 'csv',
        config: {
          unicityColumns: ['Divisions'],
          headers: [{ name: 'Divisions', config: { mappingColumn: 'Classe', anonymize: ANONYMIZATION_RULE.CLEAR } }],
        },
        createdAt: new Date(),
        createdBy: 1,
      });
      const result = formatWithMapping.anonymizeAttributes({ Classe: '3A' });
      expect(result.Classe).to.be.undefined;
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
