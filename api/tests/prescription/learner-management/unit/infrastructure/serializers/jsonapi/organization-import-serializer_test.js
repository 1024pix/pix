import { IMPORT_STATUSES } from '../../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationImport } from '../../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { serialize } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/jsonapi/organization-import-serializer.js';
import { CsvImportError } from '../../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../../test-helper.js';
describe('Unit | Serializer | JSONAPI | organization-import-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organizationInport model object into JSON API data', function () {
      // given
      const createdAt = new Date();
      const updatedAt = new Date();
      const organizationImport = new OrganizationImport({
        id: 1,
        status: IMPORT_STATUSES.VALIDATION_ERROR,
        createdAt,
        createdBy: 123,
        encoding: 'utf-8',
        // use object spread to mimic what is saved in db
        errors: [{ ...new CsvImportError('header', { line: 3 }) }],
        filename: 'filename',
        organizationId: 456,
        updatedAt,
      });
      expect(serialize(organizationImport)).to.eql({
        data: {
          id: '1',
          type: 'organization-imports',
          attributes: {
            id: 1,
            status: IMPORT_STATUSES.VALIDATION_ERROR,
            'created-at': createdAt,
            'updated-at': updatedAt,
            'created-by': 123,
            errors: [{ code: 'header', name: 'CsvImportError', meta: { line: 3 } }],
          },
        },
      });
    });
  });
});
