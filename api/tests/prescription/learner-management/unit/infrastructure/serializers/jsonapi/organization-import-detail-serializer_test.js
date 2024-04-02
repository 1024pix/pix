import { IMPORT_STATUSES } from '../../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationImportDetail } from '../../../../../../../src/prescription/learner-management/domain/read-models/OrganizationImportDetail.js';
import { serialize } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/jsonapi/organization-import-detail-serializer.js';
import { CsvImportError } from '../../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | organization-import-detail-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organizationImportDetail model object into JSON API data', function () {
      // given
      const updatedAt = new Date();
      const createdAt = new Date();
      const organizationImport = new OrganizationImportDetail({
        id: 1,
        status: IMPORT_STATUSES.VALIDATION_ERROR,
        firstName: 'Richard',
        lastName: 'Aldana',
        // use object spread to mimic what is saved in db
        errors: [{ ...new CsvImportError('header', { line: 3 }) }],
        updatedAt,
        createdAt,
      });
      expect(serialize(organizationImport)).to.eql({
        data: {
          id: '1',
          type: 'organization-import-details',
          attributes: {
            id: 1,
            status: IMPORT_STATUSES.VALIDATION_ERROR,
            'updated-at': updatedAt,
            'created-at': createdAt,
            'created-by': { firstName: 'Richard', lastName: 'Aldana' },
            errors: [{ code: 'header', name: 'CsvImportError', meta: { line: 3 } }],
          },
        },
      });
    });
  });
});
