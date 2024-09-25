import { IMPORT_KEY_FIELD } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationLearnerForAdmin } from '../../../../../../src/prescription/learner-management/domain/read-models/OrganizationLearnerForAdmin.js';
import { ObjectValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Read-models | OrganizationLearnerForAdmin', function () {
  describe('#constructor', function () {
    let validArguments;

    beforeEach(function () {
      validArguments = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2000-10-15',
        division: '3A',
        group: 'L1',
        organizationId: 1,
        organizationName: 'School',
        createdAt: new Date('2020-09-05'),
        updatedAt: new Date('2020-09-08'),
        isDisabled: false,
        organizationIsManagingStudents: true,
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should overide birthdate and division if additionalColumns and additionalInfos are given', function () {
      const learner = new OrganizationLearnerForAdmin({
        ...validArguments,
        additionalColumns: [
          {
            name: IMPORT_KEY_FIELD.COMMON_BIRTHDATE,
            key: 'dateofbirth',
          },
          { name: IMPORT_KEY_FIELD.COMMON_DIVISION, key: 'groupe' },
        ],
        additionalInformations: {
          groupe: 'CP',
          dateofbirth: '2020-02-01',
        },
      });
      expect(learner.division).to.equal('CP');
      expect(learner.birthdate).to.deep.equal('2020-02-01');
    });

    it('should throw an ObjectValidationError when id is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, id: 'not_valid' })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, id: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when firstName is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, firstName: 123456 })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, firstName: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when lastName is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, lastName: 123456 })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, lastName: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when birthdate is not valid', function () {
      // when

      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, birthdate: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should not throw an ObjectValidationError when birthdate is null', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, birthdate: null })).not.to.throw(
        ObjectValidationError,
      );
    });

    it('should not throw an ObjectValidationError when division is null', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, division: null })).not.to.throw(
        ObjectValidationError,
      );
    });

    it('should not throw an ObjectValidationError when group is null', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, group: null })).not.to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when organizationId is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, organizationId: 'not_valid' })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, organizationId: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when organizationName is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, organizationName: 123456 })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, organizationName: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when createdAt is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, createdAt: 'not_valid' })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, createdAt: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when updatedAt is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, updatedAt: 'not_valid' })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, updatedAt: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when isDisabled is not valid', function () {
      // when
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, isDisabled: 'not_valid' })).to.throw(
        ObjectValidationError,
      );
      expect(() => new OrganizationLearnerForAdmin({ ...validArguments, isDisabled: undefined })).to.throw(
        ObjectValidationError,
      );
    });

    it('should throw an ObjectValidationError when canBeDissociated is not valid', function () {
      // when
      expect(
        () => new OrganizationLearnerForAdmin({ ...validArguments, organizationIsManagingStudents: 'not_valid' }),
      ).to.throw(ObjectValidationError);
      expect(
        () => new OrganizationLearnerForAdmin({ ...validArguments, organizationIsManagingStudents: undefined }),
      ).to.throw(ObjectValidationError);
    });
  });
});
