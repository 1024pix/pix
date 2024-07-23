import { IMPORT_KEY_FIELD } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
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
          { key: 'reconcileField1', columnName: 'Nom apprenant' },
          { key: 'reconcileField2', columnName: 'catégorie' },
          { key: 'reconcileField3', columnName: 'Date de naissance' },
        ],
        validationRules: {
          formats: [
            { name: 'Nom apprenant', type: 'string', required: true },
            { name: 'Prénom apprenant', type: 'string', required: true },
            { name: 'unicity key', type: 'string', required: true },
            { name: 'catégorie', type: 'string', required: true },
            { name: 'Date de naissance', type: 'date', format: 'YYYY-MM-DD', required: true },
          ],
        },
        headers: [
          { name: 'Nom apprenant', property: 'lastName', required: true },
          { name: 'Prénom apprenant', property: 'firstName', required: true },
          { name: 'unicity key', required: true },
          { name: 'catégorie', required: true },
          { name: 'Date de naissance', required: true },
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
        { key: 'reconcileField1', columnName: 'Nom apprenant' },
        { key: 'reconcileField2', columnName: 'catégorie' },
        { key: 'reconcileField3', columnName: 'Date de naissance' },
      ]);
    });
  });

  describe('#headersFields', function () {
    it('should return headers fields', function () {
      const organizationLearnerImportFormat = new OrganizationLearnerImportFormat(
        organizationLearnerImportFormatPayload,
      );
      expect(organizationLearnerImportFormat.headersFields).to.deep.equal([
        { name: 'Nom apprenant', property: 'lastName', required: true },
        { name: 'Prénom apprenant', property: 'firstName', required: true },
        { name: 'unicity key', required: true },
        { name: 'catégorie', required: true },
        { name: 'Date de naissance', required: true },
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
        attributes: {
          catégorie: 'value2',
          'Date de naissance': 'value3',
        },
      });
    });
  });
});
