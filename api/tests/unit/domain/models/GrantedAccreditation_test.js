const GrantedAccreditation = require('../../../../lib/domain/models/GrantedAccreditation');
const { expect, domainBuilder } = require('../../../test-helper');
const _ = require('lodash');

const GRANTED_ACCREDITATION_PROPS = ['id', 'accreditationId', 'certificationCenterId'];

describe('Unit | Domain | Models | GrantedAccreditation', function () {
  let grantedAccreditations;

  beforeEach(function () {
    grantedAccreditations = domainBuilder.buildGrantedAccreditation({
      accreditationId: 456,
      certificationCenterId: 789,
    });
  });

  it('should create an object of the GrantedAccreditation type', function () {
    expect(grantedAccreditations).to.be.instanceOf(GrantedAccreditation);
  });

  it('should create an object with all the requires properties', function () {
    expect(_.keys(grantedAccreditations)).to.have.deep.members(GRANTED_ACCREDITATION_PROPS);
  });

  it('should create an object with correct properties using a domain builder', function () {
    // when
    const domainBuiltGrantedAccreditations = domainBuilder.buildGrantedAccreditation({
      id: 123,
      accreditationId: 456,
      certificationCenterId: 789,
    });

    // then
    expect(domainBuiltGrantedAccreditations.id).to.equal(123);
    expect(domainBuiltGrantedAccreditations.accreditationId).to.equal(456);
    expect(domainBuiltGrantedAccreditations.certificationCenterId).to.equal(789);
  });
});
