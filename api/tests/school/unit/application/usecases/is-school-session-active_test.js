import { execute as isSchoolSessionActive } from '../../../../../src/school/application/usecases/is-school-session-active.js';
import { expect, sinon } from '../../../../test-helper.js';

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
    const dependencies = { schoolRepository: { getSessionExpirationDate: sinon.stub() } };
    dependencies.schoolRepository.getSessionExpirationDate.resolves(undefined);

    const result = await isSchoolSessionActive({ schoolCode: 'CODE1', dependencies });

    expect(dependencies.schoolRepository.getSessionExpirationDate).to.have.been.calledWithExactly({ code: 'CODE1' });
    expect(result).to.be.false;
  });

  it('should return false if session is expired', async function () {
    const dependencies = { schoolRepository: { getSessionExpirationDate: sinon.stub() } };
    dependencies.schoolRepository.getSessionExpirationDate.resolves('2022-07-04T00:00:00.000Z');

    const result = await isSchoolSessionActive({ schoolCode: 'CODE1', dependencies });

    expect(result).to.be.false;
  });

  it('should return true if session is still active', async function () {
    const dependencies = { schoolRepository: { getSessionExpirationDate: sinon.stub() } };
    dependencies.schoolRepository.getSessionExpirationDate.resolves('2022-08-04T01:00:00.000Z');

    const result = await isSchoolSessionActive({ schoolCode: 'CODE1', dependencies });

    expect(result).to.be.true;
  });
});
