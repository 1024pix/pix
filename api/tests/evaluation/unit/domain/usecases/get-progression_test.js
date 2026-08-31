import { expect } from 'chai';
import sinon from 'sinon';

import { getProgression } from '../../../../../src/evaluation/domain/usecases/get-progression.js';
import { ForbiddenAccess, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | get-progression', function () {
  const assessmentId = 1234;
  const progressionId = `progression-${assessmentId}`;
  const userId = 9874;

  let getCampaignProgression;
  let assessmentRepository;
  let dependencies;

  beforeEach(function () {
    getCampaignProgression = sinon.stub();
    assessmentRepository = { getByAssessmentIdAndUserId: sinon.stub() };

    dependencies = {
      userId,
      progressionId,
      assessmentRepository,
      getCampaignProgression,
    };
  });

  describe('#getProgression', function () {
    context('when the assessment is for a campaign', function () {
      it('should return the progression computed by the campaign progression service', async function () {
        // given
        const campaignAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
          id: assessmentId,
          userId,
          campaignParticipationId: 555,
        });
        const expectedProgression = domainBuilder.buildProgression({ id: progressionId });

        assessmentRepository.getByAssessmentIdAndUserId.resolves(campaignAssessment);
        getCampaignProgression
          .withArgs({ assessment: campaignAssessment, progressionId })
          .resolves(expectedProgression);

        // when
        const progression = await getProgression(dependencies);

        // then
        expect(progression).to.equal(expectedProgression);
      });

      context('when the campaign participation has been deleted', function () {
        it('should throw a ForbiddenAccess error', async function () {
          // given
          const campaignAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
            id: assessmentId,
            userId,
            campaignParticipationId: null,
          });

          assessmentRepository.getByAssessmentIdAndUserId.resolves(campaignAssessment);

          // when
          const error = await catchErr(getProgression)(dependencies);

          // then
          expect(error).to.be.instanceOf(ForbiddenAccess);
          expect(getCampaignProgression).to.not.have.been.called;
        });
      });
    });

    context('when the assessment does not exist', function () {
      it('should transfer the errors', async function () {
        // given
        assessmentRepository.getByAssessmentIdAndUserId.rejects(new NotFoundError('No found Assessment for ID 1234'));

        // when
        const error = await catchErr(getProgression)(dependencies);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
