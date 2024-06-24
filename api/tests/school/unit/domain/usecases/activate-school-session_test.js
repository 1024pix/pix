import { activateSchoolSession } from '../../../../../src/school/domain/usecases/activate-school-session.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | activate-school-session', function () {
  let clock;
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should update sessionExpirationDate to now + 4h', async function () {
    const schoolRepository = { updateSessionExpirationDate: sinon.stub() };
    const nowPlus4h = new Date('2022-11-28T16:00:00Z');
    await activateSchoolSession({ organizationId: 123456, schoolRepository });
    expect(schoolRepository.updateSessionExpirationDate).to.have.been.calledWithExactly({
      organizationId: 123456,
      sessionExpirationDate: nowPlus4h,
    });
  });
});
