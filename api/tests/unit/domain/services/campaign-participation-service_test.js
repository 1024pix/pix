const { expect } = require('../../../test-helper');

const campaignParticipationService = require('./../../../../lib/domain/services/campaign-participation-service');

describe('Unit | Service | Campaign Participation Service',() => {
  describe('progress', () => {

    context('when campaign participation is completed ',() => {
      it('should return 1',() => {
        // when
        const progress = campaignParticipationService.progress(true, 10, 20);

        // then
        expect(progress).to.equal(1);
      });
    });

    context('when campaign participation is not completed', () => {
      it('should return Percentage Progression', () => {
        // when
        const progress = campaignParticipationService.progress(false, 11, 33);

        // then
        expect(progress).to.equal(0.333);
      });

      it('should return round percentage progression', () => {
        // when
        const progress = campaignParticipationService.progress(false, 6, 9);

        // then
        expect(progress).to.equal(0.667);
      });
    });
  });
});
