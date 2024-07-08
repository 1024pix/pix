import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Models | OrganizationLearnerImportFormat', function () {
  let organizationLearnerImportFormat;

  beforeEach(function () {
    organizationLearnerImportFormat = new OrganizationLearnerImportFormat({
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
      },
      createdAt: new Date('2024-01-01'),
      createdBy: 666,
    });
  });

  describe('#reconciliationFields', function () {
    it('should return reconcileFields', function () {
      expect(organizationLearnerImportFormat.reconciliationFields).to.deep.equal([
        { key: 'reconcileField1', columnName: 'Nom apprenant' },
        { key: 'reconcileField2', columnName: 'catégorie' },
        { key: 'reconcileField3', columnName: 'Date de naissance' },
      ]);
    });
  });

  describe('#headersFields', function () {
    it('should return headers fields', function () {
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
