const _ = require('lodash');

const { expect, sinon } = require('../../../test-helper');
const events = require('../../../../lib/domain/events');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | Domain | Events | handle-badge-acquisition', () => {

  describe('#handleBadgeAcquisition', () => {
    const domainTransaction = Symbol('a DomainTransaction');

    const badgeRepository = {
      findOneByTargetProfileId: _.noop,
      persist: _.noop
    };
    const campaignParticipationResultRepository = {
      getByParticipationId: _.noop,
    };

    const dependencies = {
      badgeRepository,
      campaignParticipationResultRepository,
    };

    context('when the assessment belongs to a campaign', () => {

      context('when the campaign is associated to a badge', () => {

        const assessmentCompletedEvent = new AssessmentCompleted(
          Symbol('userId'),
          Symbol('targetProfileId'),
          Symbol('campaignParticipationId')
        );

        const campaignParticipationResult = Symbol('campaignParticipationResult');

        beforeEach(() => {
          sinon.stub(badgeRepository, 'findOneByTargetProfileId');
          sinon.stub(badgeRepository, 'persist');

          sinon.stub(campaignParticipationResultRepository, 'getByParticipationId');
          campaignParticipationResultRepository.getByParticipationId.withArgs(assessmentCompletedEvent.campaignParticipationId).resolves(
            campaignParticipationResult
          );
        });

        it('should attempt to acquire the badge and save it', async () => {
          // given
          const badge = badgeStub();
          badgeRepository.findOneByTargetProfileId.withArgs(assessmentCompletedEvent.targetProfileId).resolves(badge);

          // when
          await events.handleBadgeAcquisition({ domainTransaction, assessmentCompletedEvent, ...dependencies });

          // then
          expect(badge.acquire).to.have.been.calledWithExactly(assessmentCompletedEvent.userId,  campaignParticipationResult);
          expect(badgeRepository.persist).to.have.been.calledWithExactly(domainTransaction, badge);
        });
      });
    });
  });
});

function badgeStub() {
  const badge = {
    acquire: () => {}
  };
  sinon.stub(badge, 'acquire');
  return badge;
}
