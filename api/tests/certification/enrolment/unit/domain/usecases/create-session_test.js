import { expect } from 'chai';
import sinon from 'sinon';

import { createSession } from '../../../../../../src/certification/enrolment/domain/usecases/create-session.js';

describe('Certification | Enrolment | Unit | UseCase | create-session', function () {
  let sessionRepository, sessionCodeService, dependencies;

  beforeEach(function () {
    sessionRepository = { create: sinon.fake.resolves(123) };
    sessionCodeService = { getNewSessionCode: sinon.fake.returns('MONSUPERCODE') };
    dependencies = { sessionCodeService, sessionRepository };
  });

  it('should save the session with appropriate arguments and return the id', async function () {
    const sessionId = await createSession({
      userId: 123,
      certificationCenterId: 456,
      address: '1 rue des lauriers',
      room: '2B',
      date: '2021-01-01',
      time: '14:00',
      examiner: 'Louise',
      description: 'coucou',
      ...dependencies,
    });

    expect(sessionId).to.equal(123);
    sinon.assert.calledOnceWithExactly(
      sessionRepository.create,
      sinon.match({
        userId: 123,
        certificationCenterId: 456,
        address: '1 rue des lauriers',
        room: '2B',
        date: '2021-01-01',
        time: '14:00',
        examiner: 'Louise',
        description: 'coucou',
        accessCode: 'MONSUPERCODE',
        invigilatorPassword: sinon.match.string,
      }),
    );
  });
});
