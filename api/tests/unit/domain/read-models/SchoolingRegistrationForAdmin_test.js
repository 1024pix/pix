const { expect } = require('../../../test-helper');
const SchoolingRegistrationForAdmin = require('../../../../lib/domain/read-models/SchoolingRegistrationForAdmin');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Read-models | SchoolingRegistrationForAdmin', function() {

  describe('#constructor', function() {
    let validArguments;
    beforeEach(function() {
      validArguments = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: new Date('2000-10-15'),
        division: '4B',
        organizationId: 1,
        organizationExternalId: 'EXTERNAL',
        organizationName: 'School',
        createdAt: new Date('2020-09-05'),
        updatedAt: new Date('2020-09-08'),
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin(validArguments))
        .not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when id is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, id: 'not_valid' }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, id: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when firstName is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, firstName: 123456 }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, firstName: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when lastName is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, lastName: 123456 }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, lastName: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when birthdate is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, birthdate: 'not_valid' }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, birthdate: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should not throw an ObjectValidationError when division is null or undefined', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, division: null }))
        .not.to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, division: undefined }))
        .not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when organizationId is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, organizationId: 'not_valid' }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, organizationId: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when organizationExternalId is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, organizationExternalId: 123456 }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, organizationExternalId: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when organizationName is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, organizationName: 123456 }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, organizationName: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when createdAt is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, createdAt: 'not_valid' }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, createdAt: undefined }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when updatedAt is not valid', function() {
      // when
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, updatedAt: 'not_valid' }))
        .to.throw(ObjectValidationError);
      expect(() => new SchoolingRegistrationForAdmin({ ...validArguments, updatedAt: undefined }))
        .to.throw(ObjectValidationError);
    });
  });
});
