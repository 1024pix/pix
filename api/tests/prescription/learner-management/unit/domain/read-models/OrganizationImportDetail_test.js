import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationImportDetail } from '../../../../../../src/prescription/learner-management/domain/read-models/OrganizationImportDetail.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Models | OrganizationImportDetail', function () {
  it('should instantiate an OrganizationImportDetail', function () {
    const attributes = {
      id: 1,
      status: IMPORT_STATUSES.VALIDATION_ERROR,
      errors: [{ message: 'Oups' }],
      updatedAt: new Date('2023-01-02'),
      firstName: 'Tomie',
      lastName: 'Katana',
      organizationId: 1,
      createdBy: 12,
      createdAt: new Date('2023-01-01'),
    };

    const expected = {
      id: 1,
      status: IMPORT_STATUSES.VALIDATION_ERROR,
      errors: [{ message: 'Oups' }],
      updatedAt: new Date('2023-01-02'),
      createdAt: new Date('2023-01-01'),
      createdBy: {
        firstName: 'Tomie',
        lastName: 'Katana',
      },
    };

    const organizationImportDetail = new OrganizationImportDetail(attributes);

    expect(organizationImportDetail).to.eql(expected);
  });
});
