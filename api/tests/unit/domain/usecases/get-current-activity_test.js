import { expect, sinon } from '../../../test-helper.js';
import { getCurrentActivity } from '../../../../lib/domain/usecases/get-current-activity.js';

describe('Unit | Domain | Use Cases | get-current-activity', function () {
  context('should return current activity', function () {
    it('should call the activityRepository with an assessment id equal to id_assessment ', async function () {
      const activityRepository = { getLastActivity: sinon.stub() };
      const assessmentId = 'id_assessment';

      await getCurrentActivity({ assessmentId, activityRepository });

      expect(activityRepository.getLastActivity).to.have.been.calledWith(assessmentId);
    });
  });
});
