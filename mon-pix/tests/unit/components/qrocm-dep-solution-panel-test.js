import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Component | qrocm-dep-solution-panel', function() {

  setupTest();

  describe('#inputFields', function() {

    it('should return an array with data to display', function() {
      //Given
      const challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      const answer = { value: 'smiley1: \':)\' smiley2: \'\'', result: 'ko' };

      const component = this.owner.lookup('component:qrocm-dep-solution-panel');
      component.set('challenge', challenge);
      component.set('answer', answer);

      const expectedFieldsData = [{
        label: 'content : ',
        answer: ':)',
        inputClass: '',
      }, {
        label: '<br>triste : ',
        answer: 'Pas de réponse',
        inputClass: 'correction-qroc-box-answer--aband',
      }];

      //when
      const inputFields = component.get('inputFields');

      //Then
      expect(inputFields).to.be.deep.equal(expectedFieldsData);
    });

  });

  describe('#answerIsCorrect', function() {

    it('should return true', function() {
      //Given
      const component = this.owner.lookup('component:qrocm-dep-solution-panel');
      component.set('answer', { result: 'ok' });

      //when
      const answerIsCorrect = component.get('answerIsCorrect');

      //Then
      expect(answerIsCorrect).to.be.true;
    });

    it('should return false', function() {
      //Given
      const component = this.owner.lookup('component:qrocm-dep-solution-panel');
      component.set('answer', { result: 'ko' });

      //when
      const answerIsCorrect = component.get('answerIsCorrect');

      //Then
      expect(answerIsCorrect).to.be.false;
    });
  });

  describe('#expectedAnswers', function() {

    it('should return the expected answers', function() {
      //Given
      const component = this.owner.lookup('component:qrocm-dep-solution-panel');
      component.set('inputFields', [1, 2]);
      component.set('solution', 'groupe 1:\n- horizontalité\n- organisation plate\ngroupe 2:\n- cadre');

      //when
      const expectedAnswers = component.get('expectedAnswers');

      //Then
      expect(expectedAnswers).to.be.equal('horizontalité et cadre');
    });

    it('should return examples of good answers', function() {
      //Given
      const component = this.owner.lookup('component:qrocm-dep-solution-panel');
      component.set('inputFields', [1, 2]);
      component.set('solution', 'groupe 1:\n- tag\n- slogan\ngroupe 2:\n- marche\n- sitting\ngroupe 3:\n- masque');

      //when
      const expectedAnswers = component.get('expectedAnswers');

      //Then
      expect(expectedAnswers).to.be.equal('tag ou marche ou ...');
    });
  });

});
