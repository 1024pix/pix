import { expect } from '../../../test-helper';
import campaignParticipationService from './../../../../lib/domain/services/campaign-participation-service';

describe('Unit | Service | Campaign Participation Service', function () {
  describe('progress', function () {
    context('when campaign participation is completed ', function () {
      it('should return 1', function () {
        // when
        const progress = campaignParticipationService.progress(true, 10, 20);

        // then
        expect(progress).to.equal(1);
      });
    });

    context('when campaign participation is not completed', function () {
      it('should return Percentage Progression', function () {
        // when
        const progress = campaignParticipationService.progress(false, 11, 33);

        // then
        expect(progress).to.equal(0.333);
      });

      it('should return round percentage progression', function () {
        // when
        const progress = campaignParticipationService.progress(false, 6, 9);

        // then
        expect(progress).to.equal(0.667);
      });
    });
  });
});
