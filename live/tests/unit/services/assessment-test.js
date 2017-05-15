import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | AssessmentService', function() {

  setupTest('service:assessment', {
    needs: ['model:assessment', 'model:challenge', 'model:course', 'model:answer']
  });

  function instantiateModels(store, challengesArray) {
    const challenges = challengesArray.map(
      (challenge) => store.createRecord('challenge', challenge)
    );
    const course = store.createRecord('course');
    course.get('challenges').pushObjects(challenges);
    const assessment = store.createRecord('assessment', { course });

    return { challenges, assessment };
  }

  describe('#getNextChallenge', function() {

    it('returns a promise', function() {
      return Ember.run(() => {
        const store = this.container.lookup('service:store');
        const { challenges, assessment } = instantiateModels(store, [{ id: 1 }, { id: 2 }]);

        expect(this.subject().getNextChallenge(challenges[0], assessment)).to.respondsTo('then');
      });
    });

    it('return the next challenge when current challenge is not the assessment\'s last one', function() {

      return Ember.run(() => {
        // given
        const store = this.container.lookup('service:store');
        const { challenges, assessment } = instantiateModels(store, [{ id: 1 }, { id: 2 }]);

        // when
        return this.subject()
          .getNextChallenge(challenges[0], assessment)
          .then((actual) => {
            // then
            expect(actual.get('id')).to.equal(challenges[1].get('id'));
          });
      });
    });

    it('return the next challenge when current challenge is the assessment\'s latest', function() {

      return Ember.run(() => {
        // given
        const store = this.container.lookup('service:store');
        const { challenges, assessment } = instantiateModels(store, [{ id: 1 }, { id: 2 }]);

        // when
        return this.subject()
          .getNextChallenge(challenges[1], assessment)
          .then((actual) => {
            // then
            expect(actual).to.be.null;
          });
      });
    });

    it('return challenge model objects well formed', function() {

      return Ember.run(() => {
        // given
        const store = this.container.lookup('service:store');
        const { challenges, assessment } = instantiateModels(store, [{ id: 1 }, { id: 2 }, { id: 3 }]);

        // when
        return this.subject()
          .getNextChallenge(challenges[0], assessment)
          .then((challenge1) => {

            expect(challenge1.get('id')).to.equal(challenges[1].get('id'));

            return this.subject().getNextChallenge(challenge1, assessment);
          })
          .then((challenge2) => {

            expect(challenge2.get('id')).to.equal(challenges[2].get('id'));

            return this.subject().getNextChallenge(challenge2, assessment);
          })
          .then((challenge3) => {

            expect(challenge3).to.be.null;
          });
      });
    });
  });
});
