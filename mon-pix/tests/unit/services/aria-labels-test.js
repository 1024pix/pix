import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

import Service from '@ember/service';

describe('Unit | Service | aria-labels', function() {

  setupTest();

  describe('#scoreAriaLabel', function() {

    let intlServiceStub, ariaLabelsService;

    beforeEach(function() {
      class IntlServiceStub extends Service {
        t() {}
      }
      this.owner.register('service:intl', IntlServiceStub);
      intlServiceStub = this.owner.lookup('service:intl');
      ariaLabelsService = this.owner.lookup('service:ariaLabels');
      sinon.spy(intlServiceStub, 't');
    });

    it('should return that competence is not started', async function() {
      // when
      ariaLabelsService.computeScoreAriaLabel({ isNotStarted: true });

      // then
      sinon.assert.calledWith(intlServiceStub.t, 'pages.profile.competence-card.image-info.no-level');
    });

    it('should return that first level of competence is started but not finished', async function() {
      // given
      const percentageAheadOfNextLevel = 12;

      // when
      ariaLabelsService.computeScoreAriaLabel({
        isNotStarted: false,
        currentLevel: 0,
        percentageAheadOfNextLevel,
      });

      // then
      sinon.assert.calledWith(intlServiceStub.t, 'pages.profile.competence-card.image-info.first-level', { percentageAheadOfNextLevel });
    });

    it('should return current level and percentage completed of the next level', async function() {
      // given
      const currentLevel = 2;
      const percentageAheadOfNextLevel = 30;

      // when
      ariaLabelsService.computeScoreAriaLabel({
        isNotStarted: false,
        currentLevel,
        percentageAheadOfNextLevel,
      });

      // then
      sinon.assert.calledWith(intlServiceStub.t, 'pages.profile.competence-card.image-info.level', { currentLevel, percentageAheadOfNextLevel });
    });
  });
});
