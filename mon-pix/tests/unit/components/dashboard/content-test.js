import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | Dashboard | Content', function() {
  let component;

  setupTest();

  beforeEach(function() {
    // given
    component = createGlimmerComponent('component:dashboard/content');
  });

  describe('#recommendedScorecards', function() {

    it('should return non-started scorecards', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: false },
        { id: 3, isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 3, isNotStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.recommendedScorecards;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return scorecards ordered by index', function() {
      // given
      const scorecards = [
        { id: 3, index: '3.1', isNotStarted: true },
        { id: 1, index: '1.1', isNotStarted: true },
        { id: 4, index: '2.4', isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, index: '1.1', isNotStarted: true },
        { id: 4, index: '2.4', isNotStarted: true },
        { id: 3, index: '3.1', isNotStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.recommendedScorecards;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return a maximum of four cards', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: true },
        { id: 3, isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: true },
      ];

      component.args.model = EmberObject.create({ scorecards });

      // when
      const result = component.recommendedScorecards;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

  });

  describe('#startedCompetences', function() {

    it('should return started competences', function() {
      // given
      const scorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: false },
        { id: 3, isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 3, isStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.startedCompetences;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return scorecards ordered by index', function() {
      // given
      const scorecards = [
        { id: 3, index: '3.1', isStarted: true },
        { id: 1, index: '1.1', isStarted: true },
        { id: 4, index: '2.4', isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, index: '1.1', isStarted: true },
        { id: 4, index: '2.4', isStarted: true },
        { id: 3, index: '3.1', isStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.startedCompetences;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return a maximum of four cards', function() {
      // given
      const scorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: true },
        { id: 3, isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: true },
      ];

      component.args.model = EmberObject.create({ scorecards });

      // when
      const result = component.startedCompetences;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });
  });

  describe('#userFirstname', function() {
    it('should return userFirstname', function() {
      // given
      const userFirstName = 'user firstname';
      component.currentUser = EmberObject.create({ user: { firstName: userFirstName } });

      // when
      const result = component.userFirstname;

      // then
      expect(result).to.equal(userFirstName);
    });
  });
});
