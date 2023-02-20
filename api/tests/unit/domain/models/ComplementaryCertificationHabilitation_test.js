import ComplementaryCertificationHabilitation from '../../../../lib/domain/models/ComplementaryCertificationHabilitation';
import { expect, domainBuilder } from '../../../test-helper';
import _ from 'lodash';

const COMPLEMENTARY_CERTIFICATION_HABILITATION_PROPS = ['id', 'complementaryCertificationId', 'certificationCenterId'];

describe('Unit | Domain | Models | ComplementaryCertificationHabilitation', function () {
  let complementaryCertificationHabilitation;

  beforeEach(function () {
    complementaryCertificationHabilitation = domainBuilder.buildComplementaryCertificationHabilitation({
      complementaryCertificationId: 456,
      certificationCenterId: 789,
    });
  });

  it('should create an object of the ComplementaryCertificationHabilitation type', function () {
    expect(complementaryCertificationHabilitation).to.be.instanceOf(ComplementaryCertificationHabilitation);
  });

  it('should create an object with all the requires properties', function () {
    expect(_.keys(complementaryCertificationHabilitation)).to.have.deep.members(
      COMPLEMENTARY_CERTIFICATION_HABILITATION_PROPS
    );
  });

  it('should create an object with correct properties using a domain builder', function () {
    // when
    const complementaryCertificationHabilitation = domainBuilder.buildComplementaryCertificationHabilitation({
      id: 123,
      complementaryCertificationId: 456,
      certificationCenterId: 789,
    });

    // then
    expect(complementaryCertificationHabilitation.id).to.equal(123);
    expect(complementaryCertificationHabilitation.complementaryCertificationId).to.equal(456);
    expect(complementaryCertificationHabilitation.certificationCenterId).to.equal(789);
  });
});
