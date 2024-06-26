import { Habilitation } from '../../../../../../src/certification/enrolment/domain/models/Habilitation.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | Habilitation', function () {
  it('should build an Habilitation', function () {
    // given
    const data = { complementaryCertificationId: 12, key: 'A_KEY', label: 'This is a key' };

    // when
    const habilitation = new Habilitation(data);

    // then
    expect(habilitation).to.be.instanceOf(Habilitation);
    expect(habilitation).to.deep.equal({ complementaryCertificationId: 12, key: 'A_KEY', label: 'This is a key' });
  });

  it('should throw an error when trying to construct an invalid habilitation', function () {
    // given
    const notAValidHabilitation = { id: 12, iAM: 'a bad object' };

    // when
    const error = catchErrSync((badData) => new Habilitation(badData))(notAValidHabilitation);

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });
});
