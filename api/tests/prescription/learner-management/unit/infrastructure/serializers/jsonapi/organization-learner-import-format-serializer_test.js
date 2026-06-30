import { OrganizationLearnerImportFormat } from '../../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import { organizationLearnerImportFormatSerializer } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/jsonapi/organization-learner-import-format-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | organization-learner-import-format-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organizationLearnerImportFormat model object into JSON API data', function () {
      // given
      const updatedAt = new Date();
      const createdAt = new Date();
      const organizationImport = new OrganizationLearnerImportFormat({
        id: 123,
        name: 'SCOIMPORT',
        fileType: 'csv',
        config: {
          acceptedEncoding: ['utf-8'],
          unicityColumns: ['my_column'],
          validationRules: { formats: [{ name: 'my_column', type: 'string' }] },
          headers: [
            {
              name: 'Prénom apprenant',
              config: {
                property: 'firstName',
                validate: {
                  type: 'string',
                  required: true,
                },
                reconcile: {
                  name: 'COMMON_FIRSTNAME',
                  fieldId: 'reconcileField2',
                  position: 2,
                },
              },
              required: true,
            },
          ],
        },
        createdBy: 1,
        updatedAt,
        createdAt,
      });

      expect(organizationLearnerImportFormatSerializer.serialize(organizationImport)).deep.equal({
        data: {
          type: 'organization-learner-import-formats',
          id: '123',
          attributes: {
            'file-type': 'csv',
            name: 'SCOIMPORT',
            config: organizationImport.config,
          },
        },
      });
    });
  });
});
