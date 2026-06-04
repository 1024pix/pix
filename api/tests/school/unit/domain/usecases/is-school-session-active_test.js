import sinon from 'sinon';

import { isSchoolSessionActive } from '../../../../../src/school/domain/usecases/is-school-session-active.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | is-session-active', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2022-08-04');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should return false if no sessionExpirationDate found for school', async function () {
    const schoolRepository = { getSessionExpirationDate: sinon.stub() };
    schoolRepository.getSessionExpirationDate.resolves(undefined);

    const result = await isSchoolSessionActive({ schoolCode: 'CODE1', schoolRepository });

    expect(schoolRepository.getSessionExpirationDate).to.have.been.calledWithExactly({ code: 'CODE1' });
    expect(result).to.be.false;
  });

  it('should return false if session is expired', async function () {
    const schoolRepository = { getSessionExpirationDate: sinon.stub() };
    schoolRepository.getSessionExpirationDate.resolves('2022-07-04T00:00:00.000Z');

    const result = await isSchoolSessionActive({ schoolCode: 'CODE1', schoolRepository });

    expect(result).to.be.false;
  });

  it('should return true if session is still active', async function () {
    const schoolRepository = { getSessionExpirationDate: sinon.stub() };
    schoolRepository.getSessionExpirationDate.resolves('2022-08-04T01:00:00.000Z');

    const result = await isSchoolSessionActive({ schoolCode: 'CODE1', schoolRepository });

    expect(result).to.be.true;
  });
});
