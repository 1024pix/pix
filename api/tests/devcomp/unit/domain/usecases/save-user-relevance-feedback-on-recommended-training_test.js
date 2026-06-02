import sinon from 'sinon';

import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Devcomp | Domain | UseCases | saveUserRelevanceFeedbackOnRecommendedTraining', function () {
  it('it returns NotFoundError when userRecommendedTraining does not exist', async function () {
    // given
    const params = {
      userId: 'user123',
      trainingId: 'training456',
      campaignParticipationId: 'campaignParticipation789',
    };

    const dataToSave = {
      ...params,
      isRelevant: true,
    };

    const userRecommendedTrainingRepositoryStub = {
      findByCampaignParticipationIdAndTrainingIdAndUserId: sinon.stub().resolves(null),
    };

    // when
    const error = await catchErr(usecases.saveUserRelevanceFeedbackOnRecommendedTraining)({
      ...dataToSave,
      userRecommendedTrainingRepository: userRecommendedTrainingRepositoryStub,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });

  it('it returns userRecommendedTraing when it exists', async function () {
    // given
    const params = {
      userId: 'user123',
      trainingId: 'training456',
      campaignParticipationId: 'campaignParticipation789',
    };
    const dataToSave = {
      ...params,
      isRelevant: true,
    };

    const userRecommendedTraining = Symbol('userRecommendedTraining');
    const savedUserRecommendedTraining = Symbol('savedUserRecommendedTraining');

    const userRecommendedTrainingRepositoryStub = {
      findByCampaignParticipationIdAndTrainingIdAndUserId: sinon.stub().resolves(userRecommendedTraining),
      save: sinon.stub().resolves(savedUserRecommendedTraining),
    };

    // when
    const result = await usecases.saveUserRelevanceFeedbackOnRecommendedTraining({
      ...dataToSave,
      userRecommendedTrainingRepository: userRecommendedTrainingRepositoryStub,
    });

    // then
    expect(result).to.deep.equal(savedUserRecommendedTraining);
    expect(
      userRecommendedTrainingRepositoryStub.findByCampaignParticipationIdAndTrainingIdAndUserId,
    ).to.have.been.calledOnceWithExactly({ ...params });
    expect(userRecommendedTrainingRepositoryStub.save).to.have.been.calledOnceWithExactly({
      ...dataToSave,
    });
  });
});
