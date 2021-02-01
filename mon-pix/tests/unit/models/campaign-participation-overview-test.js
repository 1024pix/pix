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

    it('should return the status "started"', function() {
      // given
      const model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'started',
      });
      // when / then
      expect(model.status).to.equal('started');
    });

    it('should return the status "completed"', function() {
      // given
      const model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'completed',
      });
      // when / then
      expect(model.status).to.equal('completed');
    });

    it('should return the status "finished"', function() {
      // given
      const model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'completed',
        isShared: true,
      });
      // when / then
      expect(model.status).to.equal('finished');
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
