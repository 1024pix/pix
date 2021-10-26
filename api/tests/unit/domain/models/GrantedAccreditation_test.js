const GrantedAccreditation = require('../../../../lib/domain/models/GrantedAccreditation');
const { expect, domainBuilder } = require('../../../test-helper');
const _ = require('lodash');

const GRANTED_ACCREDITATION_PROPS = ['id', 'accreditationId', 'certificationCenterId'];

describe('Unit | Domain | Models | GrantedAccreditation', function () {
  let complementaryCertificationHabilitation;

  beforeEach(function () {
    complementaryCertificationHabilitation = domainBuilder.buildComplementaryCertificationHabilitation({
      accreditationId: 456,
      certificationCenterId: 789,
    });
  });

  it('should create an object of the GrantedAccreditation type', function () {
    expect(complementaryCertificationHabilitation).to.be.instanceOf(GrantedAccreditation);
  });

  it('should create an object with all the requires properties', function () {
    expect(_.keys(complementaryCertificationHabilitation)).to.have.deep.members(GRANTED_ACCREDITATION_PROPS);
  });

  it('should create an object with correct properties using a domain builder', function () {
    // when
    const complementaryCertificationHabilitation = domainBuilder.buildComplementaryCertificationHabilitation({
      id: 123,
      accreditationId: 456,
      certificationCenterId: 789,
    });

    // then
    expect(complementaryCertificationHabilitation.id).to.equal(123);
    expect(complementaryCertificationHabilitation.accreditationId).to.equal(456);
    expect(complementaryCertificationHabilitation.certificationCenterId).to.equal(789);
  });
});
