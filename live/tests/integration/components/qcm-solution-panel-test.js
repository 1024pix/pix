import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import _ from 'pix-live/utils/lodash-custom';

const CHECKBOX_CORRECT_AND_CHECKED = 'input[type=checkbox]:eq(1)';
const LABEL_CORRECT_AND_CHECKED = '.qcm-proposal-label__oracle:eq(1)';

const CHECKBOX_CORRECT_AND_UNCHECKED = '.qcm-proposal-label__checkbox-picture:eq(2)';
const LABEL_CORRECT_AND_UNCHECKED = '.qcm-proposal-label__oracle:eq(2)';

const LABEL_INCORRECT_AND_CHECKED = '.qcm-proposal-label__oracle:eq(0)';
const LABEL_INCORRECT_AND_UNCHECKED = '.qcm-proposal-label__oracle:eq(0)';

const CSS_LINETHROUGH_ON = 'line-through';
const CSS_LINETHROUGH_OFF = 'none';

const assessment = {};
let challenge = null;
let answer = null;
let solution = null;

function charCount(str) {
  return str.match(/[a-zA-Z]/g).length;
}

describe('Integration | Component | qcm-solution-panel.js', function() {

  setupComponentTest('qcm-solution-panel', {
    integration: true
  });

  describe('#Component should renders: ', function() {

    it('Should renders', function() {
      this.render(hbs`{{qcm-solution-panel}}`);
      expect(this.$()).to.have.lengthOf(1);
      expect($(LABEL_CORRECT_AND_CHECKED)).to.have.lengthOf(0);
    });

    describe('checkbox state', function() {
      const correctAnswer = {
        id: 'answer_id', assessment, challenge, value: '2,4'
      };

      const unCorrectAnswer = {
        id: 'answer_id', assessment, challenge, value: '1,4'
      };

      before(function() {
        challenge = Ember.Object.create({
          id: 'challenge_id',
          proposals: '-foo\n- bar\n- qix\n- yon',
          type: 'QCM'
        });

        solution = Ember.Object.create({
          id: 'solution_id', value: '2,3'
        });

        answer = Ember.Object.create(correctAnswer);
      });

      it('QCM, la réponse correcte est cochée', function() {
        // Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(LABEL_CORRECT_AND_CHECKED)).to.have.lengthOf(1);
        expect($(CHECKBOX_CORRECT_AND_CHECKED)).to.have.lengthOf(1);

        expect($(CHECKBOX_CORRECT_AND_CHECKED).attr('disabled')).to.equal('disabled');
        expect(charCount($(LABEL_CORRECT_AND_CHECKED).text())).to.be.above(0);
        expect($(LABEL_CORRECT_AND_CHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_OFF);
      });

      it('QCM, aucune réponse incorrecte n\'est cochée', function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(charCount($(LABEL_INCORRECT_AND_UNCHECKED).text())).to.be.above(0);
        expect($(LABEL_INCORRECT_AND_UNCHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_OFF);
      });

      it('QCM, Au moins l\'une des réponse correcte n\'est pas cochée', function() {
        //Given
        answer = Ember.Object.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(charCount($(LABEL_CORRECT_AND_UNCHECKED).text())).to.be.above(0);
        expect($(LABEL_CORRECT_AND_UNCHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_OFF);
      });

      it('QCM, au moins l\'une des réponse incorrecte est cochée', function() {
        //Given
        answer = Ember.Object.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(CHECKBOX_CORRECT_AND_UNCHECKED).is(':checked')).to.equal(false);
        expect(charCount($(LABEL_INCORRECT_AND_CHECKED).text())).to.be.above(0);
        expect($(LABEL_INCORRECT_AND_CHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_ON);

      });

      it('Aucune case à cocher n\'est cliquable', function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        const size = $('.comparison-window .qcm-proposal-label__checkbox-picture').length;
        _.times(size, function(index) {
          expect($('.comparison-window .qcm-proposal-label__checkbox-picture:eq(' + index + ')').is(':disabled')).to.equal(true);
        });
      });
    });
  });
});
