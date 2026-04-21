import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import {
  AggregateImportError,
  SiecleXmlImportError,
} from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { OrganizationImportDetail } from '../../../../../../src/prescription/learner-management/domain/read-models/OrganizationImportDetail.js';

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
      updatedAt: new Date('2023-01-02'),
      createdAt: new Date('2023-01-01'),
      createdBy: {
        firstName: 'Tomie',
        lastName: 'Katana',
      },
    };

    const organizationImportDetail = new OrganizationImportDetail(attributes);

    expect(organizationImportDetail).to.deep.equal(expected);
    expect(organizationImportDetail.errors).to.deep.equal([{ message: 'Oups' }]);
    expect(organizationImportDetail.hasFixableErrors).to.equal(false);
  });

  describe('hasFixableErrors', function () {
    let data;

    beforeEach(function () {
      data = {
        id: 1,
        status: IMPORT_STATUSES.VALIDATION_ERROR,
        updatedAt: new Date('2023-01-02'),
        firstName: 'Tomie',
        lastName: 'Katana',
        organizationId: 1,
        createdBy: 12,
        createdAt: new Date('2023-01-01'),
      };
    });

    it('should return true if error is AggregateImportError', function () {
      const organizationImportDetail = new OrganizationImportDetail({
        ...data,
        errors: [new AggregateImportError([new Error('oups')])],
      });
      expect(organizationImportDetail.hasFixableErrors).to.be.true;
    });

    it('should return true if error has a code property', function () {
      const organizationImportDetail = new OrganizationImportDetail({
        ...data,
        errors: [new SiecleXmlImportError('oups')],
      });
      expect(organizationImportDetail.hasFixableErrors).to.be.true;
    });

    it('should return false if there is no error', function () {
      const organizationImportDetail = new OrganizationImportDetail({
        ...data,
        errors: undefined,
      });
      expect(organizationImportDetail.hasFixableErrors).to.be.false;
    });

    it("should return false if errors doesn't contains DomainError", function () {
      const organizationImportDetail = new OrganizationImportDetail({
        ...data,
        errors: [new Error('oups')],
      });

      expect(organizationImportDetail.hasFixableErrors).to.be.false;
    });
  });

  describe('errors', function () {
    it('should remove stack trace informations from errors', function () {
      // given
      const updatedAt = new Date();
      const createdAt = new Date();

      const organizationImport = new OrganizationImportDetail({
        id: 1,
        status: IMPORT_STATUSES.VALIDATION_ERROR,
        firstName: 'Richard',
        lastName: 'Aldana',
        // use object spread to mimic what is saved in db
        errors: [{ ...new SiecleXmlImportError('plop', 'line 2'), stack: 'Error stack' }],
        updatedAt,
        createdAt,
      });
      expect(organizationImport.errors).to.deep.equal([
        { code: 'plop', meta: 'line 2', name: 'SiecleXmlImportError', id: null },
      ]);
    });
  });
});
