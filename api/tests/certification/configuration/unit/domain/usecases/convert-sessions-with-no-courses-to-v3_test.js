import { convertSessionsWithNoCoursesToV3 } from '../../../../../../src/certification/configuration/domain/usecases/convert-sessions-with-no-courses-to-v3.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | convert-sessions-with-no-courses-to-v3', function () {
  it('should update v2 sessions with no certification courses to v3', async function () {
    const sessionsRepository = {
      updateV2SessionsWithNoCourses: sinon.stub().resolves(),
    };

    await convertSessionsWithNoCoursesToV3({ isDryRun: false, sessionsRepository });

    expect(sessionsRepository.updateV2SessionsWithNoCourses).to.have.been.calledOnceWith();
  });

  context('when isDryRun is true', function () {
    it('should skip update', async function () {
      const sessionsRepository = {
        updateV2SessionsWithNoCourses: sinon.stub().resolves(),
        findV2SessionIdsWithNoCourses: sinon.stub().resolves(['123']),
      };

      await convertSessionsWithNoCoursesToV3({ isDryRun: true, sessionsRepository });

      expect(sessionsRepository.updateV2SessionsWithNoCourses).not.to.have.been.called;
      expect(sessionsRepository.findV2SessionIdsWithNoCourses).to.have.been.calledOnceWith();
    });
  });
});
