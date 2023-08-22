import { expect, sinon, domainBuilder, catchErr } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { getCurrentActivity } from '../../../../../lib/domain/services/1d/activity.js';

describe('Unit | Service | Activity', function () {

  describe('#getCurrentActivity', function () {
    let activityRepository;

    it('call activityRepository#getLastActivity with assessmentId', function () {
      const activity = Symbol();
      const assessmentId = 'id_assessment';
      activityRepository = {
        getLastActivity: sinon.stub(),
      };

      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .resolves(activity);

      getCurrentActivity(activityRepository, assessmentId)

      expect(activityRepository.getLastActivity).to.have.been.calledOnceWith(assessmentId);
    });

    it('does not throw an error with a NotFoundError', async function () {
      const activity = Symbol();
      const assessmentId = 'id_assessment';
      activityRepository = {
        getLastActivity: sinon.stub(),
      };

      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .rejects(new NotFoundError());

      const functionToCall = async () => {
        await getCurrentActivity(activityRepository, assessmentId);
      }

      expect(functionToCall).to.not.throw();
    });

    it('throw an error when not a NotFoundError', async function () {
      const activity = Symbol();
      const assessmentId = 'id_assessment';
      activityRepository = {
        getLastActivity: sinon.stub(),
      };

      activityRepository.getLastActivity
        .withArgs(assessmentId)
        .rejects(new Error());

      const error = await catchErr(getCurrentActivity)(activityRepository, assessmentId);
      expect(error).not.to.be.instanceOf(NotFoundError);
    });

  });
});

