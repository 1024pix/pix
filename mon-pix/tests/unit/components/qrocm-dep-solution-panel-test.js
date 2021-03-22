import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

describe('Unit | Component | qrocm-dep-solution-panel', function() {

  setupTest();
  setupIntl();

  describe('#inputFields', function() {

    it('should return an array with data to display', function() {
      //Given
      const challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      const answer = { value: 'smiley1: \':)\' smiley2: \'\'', result: 'ko' };

      const component = createGlimmerComponent('component:qrocm-dep-solution-panel', { challenge, answer });

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
      const inputFields = component.inputFields;

      //Then
      expect(inputFields).to.be.deep.equal(expectedFieldsData);
    });

  });

  describe('#answerIsCorrect', function() {

    it('should return true', function() {
      //Given
      const component = createGlimmerComponent('component:qrocm-dep-solution-panel', { answer: { result: 'ok' } });

      //when
      const answerIsCorrect = component.answerIsCorrect;

      //Then
      expect(answerIsCorrect).to.be.true;
    });

    it('should return false', function() {
      //Given
      const component = createGlimmerComponent('component:qrocm-dep-solution-panel', { answer: { result: 'ko' } });

      //when
      const answerIsCorrect = component.answerIsCorrect;

      //Then
      expect(answerIsCorrect).to.be.false;
    });
  });

  describe('#understandableSolution', function() {

    it('should return the expected answers', function() {
      //Given
      const challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      const component = createGlimmerComponent('component:qrocm-dep-solution-panel', {
        challenge,
        answer: { result: 'ko' },
        inputFields: [1, 2],
        solution: 'groupe 1:\n- horizontalité\n- organisation plate\ngroupe 2:\n- cadre',
      });

      //when
      const understandableSolution = component.understandableSolution;

      //Then
      expect(understandableSolution).to.be.equal('horizontalité et cadre');
    });

    it('should return examples of good answers', function() {
      //Given
      const challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      const component = createGlimmerComponent('component:qrocm-dep-solution-panel', {
        challenge,
        answer: { result: 'ko' },
        inputFields: [1, 2],
        solution: 'groupe 1:\n- tag\n- slogan\ngroupe 2:\n- marche\n- sitting\ngroupe 3:\n- masque',
      });

      //when
      const understandableSolution = component.understandableSolution;

      //Then
      expect(understandableSolution).to.be.equal('tag ou marche ou ...');
    });
  });

});
