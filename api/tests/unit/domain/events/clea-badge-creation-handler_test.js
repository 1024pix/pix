const { expect, sinon } = require('../../../test-helper');
const { cleaBadgeCreationHandler } = require('../../../../lib/domain/events/clea-badge-creation-handler');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');

describe('Unit | Domain | Events | clea-badge-creation-handler', () => {
  describe('#handle', () => {
    context('when the assessment belongs to a campaign', () => {
      context('when the campaign is associated to a badge', () => {
        it('should create a badge when badge requirements are fulfilled', async () => {
          // given
          const userId = 42;
          const event = new AssessmentCompleted(userId);
          const badgeId = 4;
          sinon.stub(badgeRepository, 'findOneByTargetProfileId');
          badgeRepository.findOneByTargetProfileId.resolves({ id: badgeId });
          sinon.stub(badgeAcquisitionRepository, 'create');

          // when
          await cleaBadgeCreationHandler.handle(event);

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly({ badgeId, userId });
        });
      });
    });
  });
});
