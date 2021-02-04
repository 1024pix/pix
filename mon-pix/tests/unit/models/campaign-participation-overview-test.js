import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Campaign-Participation-Overview', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  describe('#status', () => {
    context('when the campaign is not archived', function() {
      context('when the assessment state is "started"', () => {
        it('should return the status "started"', function() {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            assessmentState: 'started',
          });
          // when / then
          expect(model.status).to.equal('started');
        });
      });

      context('when the assessment state is "completed, the participation is not shared"', () => {
        it('should return the status "completed"', function() {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            assessmentState: 'completed',
            isShared: false,
            campaignArchivedAt: null,
          });
          // when / then
          expect(model.status).to.equal('completed');
        });
      });

      context('when the assessment state is "completed and the participation is shared"', () => {
        it('should return the status "finished"', function() {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            assessmentState: 'completed',
            campaignArchivedAt: null,
            isShared: true,
          });
          // when / then
          expect(model.status).to.equal('finished');
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
        expect(model.status).to.equal('archived');
      });
    });
  });

  describe('#date', function() {
    it('should return the starting date when the status is "started"', function() {
      // given
      const model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'started',
        createdAt: '2020-12-10T15:16:20.109Z',
      });

      // when / then
      expect(model.date).to.equal('2020-12-10T15:16:20.109Z');
    });

    it('should return the starting date when the status is "completed"', function() {
      // given
      const model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'completed',
        createdAt: '2020-12-10T15:16:20.109Z',
      });

      // when / then
      expect(model.date).to.equal('2020-12-10T15:16:20.109Z');
    });

    it('should return the sharing date when the status is "finished"', function() {
      // given
      const model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'completed',
        isShared: true,
        sharedAt: '2020-12-18T15:16:20.109Z',
      });

      // when / then
      expect(model.date).to.equal('2020-12-18T15:16:20.109Z');
    });
  });
});
