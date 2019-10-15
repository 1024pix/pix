import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { A } from '@ember/array';
import EmberObject from '@ember/object';

describe('Unit | Component | certification-progress', function() {

  setupTest();

  describe('@currentAnswerNumber', () => {
    let component, firstAnswer, secondAnswer, assessment;

    beforeEach(function() {
      // given
      component = this.owner.lookup('component:certification-progress');
      firstAnswer = EmberObject.create({ id: 1, challenge: EmberObject.create({ id: 'recChallenge1' }) }),
      secondAnswer = EmberObject.create({ id: 2, challenge: EmberObject.create({ id: undefined }) }),
      assessment = EmberObject.create({
        answers: A([firstAnswer, secondAnswer])
      });
      component.set('assessment', assessment);

      // pre-compute property to check that dependencies cause recomputation
      component.get('currentAnswerNumber');
    });

    it('when challenge was answered, should return the matching answer number', function() {
      // when
      component.set('challengeId', 'recChallenge1');

      // then
      expect(component.get('currentAnswerNumber')).to.equal(1);
    });

    it('when challenge is new but not all answers are loaded, should return an empty string', function() {
      // when
      component.set('challengeId', 'recChallengeNew');

      // then
      expect(component.get('currentAnswerNumber')).to.equal('');
    });

    it('when challenge is new and all answers are loaded, should return the next answer number', function() {
      // when
      component.set('challengeId', 'recChallengeNew');
      secondAnswer.set('challenge.id', 'recChallenge2');

      // then
      expect(component.get('currentAnswerNumber')).to.equal(3);
    });

    it('when challenge is known and then answer is loaded, should return the matching answer number', function() {
      // when
      component.set('challengeId', 'recChallenge2');
      secondAnswer.set('challenge.id', 'recChallenge2');

      // then
      expect(component.get('currentAnswerNumber')).to.equal(2);
    });
  });
});
