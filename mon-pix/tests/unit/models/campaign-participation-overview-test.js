import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe.only('Unit | Model | Campaign-Participation-Overview', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  describe('#status', () => {
    context('when the campaign is not archived', function() {
      context('when the assessment state is "started"', () => {
        it('should return the status "ONGOING"', function() {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            assessmentState: 'started',
          });
          // when / then
          expect(model.status).to.equal('ONGOING');
        });
      });

      context('when the assessment state is "completed" and the participation is not shared"', () => {
        it('should return the status "TO_SHARE"', function() {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            assessmentState: 'completed',
            isShared: false,
            campaignArchivedAt: null,
          });
          // when / then
          expect(model.status).to.equal('TO_SHARE');
        });
      });

      context('when the assessment state is "completed" and the participation is shared"', () => {
        it('should return the status "ENDED"', function() {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            assessmentState: 'completed',
            campaignArchivedAt: null,
            isShared: true,
          });
          // when / then
          expect(model.status).to.equal('ENDED');
        });
      });
    });

    context('when the campaign is archived"', () => {
      it('should return the status "archived"', function() {
        // given
        const model = store.createRecord('campaign-participation-overview', {
          assessmentState: 'completed',
          isShared: true,
          campaignArchivedAt: new Date('2021-01-01'),
        });
        // when / then
        expect(model.status).to.equal('ARCHIVED');
      });
    });

    context('when the campaign is for absolute novice"', () => {
      it('should return the status "ONGOING" if not finished', function() {
        // given
        const model = store.createRecord('campaign-participation-overview', {
          assessmentState: 'started',
          isShared: false,
          campaignIsForAbsoluteNovice: true,
          campaignArchivedAt: null,
        });
        // when / then
        expect(model.status).to.equal('ONGOING');
      });
      it('should return the status "ENDED" if the assessment is finished', function() {
        // given
        const model = store.createRecord('campaign-participation-overview', {
          assessmentState: 'completed',
          isShared: false,
          campaignIsForAbsoluteNovice: true,
          campaignArchivedAt: null,
        });
        // when / then
        expect(model.status).to.equal('ENDED');
      });
    });
  });
});
