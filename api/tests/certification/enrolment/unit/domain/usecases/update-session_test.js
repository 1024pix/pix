import sinon from 'sinon';

import { updateSession } from '../../../../../../src/certification/enrolment/domain/usecases/update-session.js';

describe('Certification | Enrolment | Unit | UseCase | update-session', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('submits the update of the session', async function () {
    const sessionRepository = { updateInfo: sinon.fake.resolves() };

    await updateSession({
      address: '1 rue des lauriers',
      room: '2B',
      date: '2021-01-01',
      time: '14:00',
      examiner: 'Louise',
      description: 'coucou',
      sessionId: 345,
      sessionRepository,
    });

    sinon.assert.calledOnceWithExactly(sessionRepository.updateInfo, {
      id: 345,
      address: '1 rue des lauriers',
      room: '2B',
      date: '2021-01-01',
      time: '14:00',
      examiner: 'Louise',
      description: 'coucou',
    });
  });
});
