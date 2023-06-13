import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';
import * as activityRepository from '../../../../lib/infrastructure/repositories/activity-repository.js';
import { Activity } from '../../../../lib/domain/models/Activity.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | activityRepository', function () {
  describe('#save', function () {
    afterEach(async function () {
      await knex('activities').delete();
    });

    it('should save and return the activity', async function () {
      // given
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
      await databaseBuilder.commit();

      const activityToSave = new Activity({
        level: Activity.levels.TRAINING,
        assessmentId,
      });

      // when
      const savedActivity = await activityRepository.save(activityToSave);

      // then
      const activityInDb = await knex('activities').where({ id: savedActivity.id }).first();
      expect(savedActivity).to.deep.equal(activityInDb);
    });
  });
  describe('#updateStatus', function () {
    afterEach(async function () {
      await knex('activities').delete();
    });
    context('when the activity exists', function () {
      it('should update status', async function () {
        // given
        const activityId = databaseBuilder.factory.buildActivity().id;
        await databaseBuilder.commit();

        // when
        const updatedActivity = await activityRepository.updateStatus({ activityId, status: Activity.status.SKIPPED });

        // then
        expect(updatedActivity.status).to.deep.equal(Activity.status.SKIPPED);
      });
    });
    context('when the activity does not exists', function () {
      it('should return not found error', async function () {
        // given
        const activityId = '1234567890';

        // when
        const error = await catchErr(activityRepository.updateStatus)({ activityId, status: Activity.status.SKIPPED });

        // then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });
  describe('#getLastActivity', function () {
    context('when there is no activity for the given assessmentId', function () {
      it('should return an error', async function () {
        //given
        const assessmentId = '789045';
        databaseBuilder.factory.buildActivity();
        databaseBuilder.commit();

        // when
        const error = await catchErr(activityRepository.getLastActivity)(assessmentId);

        // then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
    context('when there is an activity for the given assessmentId', function () {
      it('should return the corresponding activity', async function () {
        //given
        const { assessmentId, id } = databaseBuilder.factory.buildActivity();
        await databaseBuilder.commit();

        // when
        const activity = await activityRepository.getLastActivity(assessmentId);

        // then
        expect(activity.id).to.equal(id);
      });
    });
    context('when there is several activities for the given assessmentId', function () {
      it('should return the last activity', async function () {
        //given
        const assessmentId = databaseBuilder.factory.buildAssessment().id;
        databaseBuilder.factory.buildActivity({ assessmentId, createdAt: new Date('2022-09-13') });
        const lastActivity = databaseBuilder.factory.buildActivity({ assessmentId, createdAt: new Date('2022-09-14') });
        databaseBuilder.factory.buildActivity({ assessmentId, createdAt: new Date('2022-09-12') });
        await databaseBuilder.commit();

        // when
        const activity = await activityRepository.getLastActivity(assessmentId);

        // then
        expect(activity.id).to.equal(lastActivity.id);
      });
    });
  });
});
