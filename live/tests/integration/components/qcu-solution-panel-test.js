import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import _ from 'pix-live/utils/lodash-custom';
import $ from 'jquery';

const RADIO_CORRECT_AND_CHECKED = '.picture-radio-proposal--qcu:eq(1)';
const LABEL_CORRECT_AND_CHECKED = '.qcu-proposal-label__oracle:eq(1)';

const LABEL_CORRECT_AND_UNCHECKED = '.qcu-proposal-label__oracle:eq(1)';

const RADIO_INCORRECT_AND_CHECKED = '.picture-radio-proposal--qcu:eq(2)';
const LABEL_INCORRECT_AND_CHECKED = '.qcu-proposal-label__oracle:eq(2)';

const RADIO_INCORRECT_AND_UNCHECKED = '.picture-radio-proposal--qcu:eq(0)';
const LABEL_INCORRECT_AND_UNCHECKED = '.qcu-proposal-label__oracle:eq(0)';

const CSS_LINETHROUGH_ON = 'line-through';
const CSS_LINETHROUGH_OFF = 'none';

const assessment = {};
let challenge = null;
let answer = null;
let solution = null;

function charCount(str) {
  return str.match(/[a-zA-Z]/g).length;
}

describe('Integration | Component | qcu-solution-panel.js', function() {
  setupComponentTest('qcu-solution-panel', {
    integration: true
  });

  const correctAnswer = {
    id: 'answer_id', assessment, challenge, value: '2'
  };

  const unCorrectAnswer = {
    id: 'answer_id', assessment, challenge, value: '3'
  };

  describe('#Component should renders: ', function() {

    it('Should renders', function() {
      this.render(hbs`{{qcu-solution-panel}}`);
      expect(this.$()).to.have.lengthOf(1);
      expect($(LABEL_CORRECT_AND_CHECKED)).to.have.lengthOf(0);
    });

    describe('Radio state', function() {

      before(function() {
        challenge = EmberObject.create({
          id: 'challenge_id',
          proposals: '-foo\n- bar\n- qix\n- yon',
          type: 'QCM'
        });

        solution = '2';

        answer = EmberObject.create(correctAnswer);
      });

      it('QCU,la réponse correcte est cochée', function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);
        // When
        this.render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(LABEL_CORRECT_AND_CHECKED)).to.have.lengthOf(1);
        expect($(RADIO_CORRECT_AND_CHECKED)).to.have.lengthOf(1);

        expect($(RADIO_CORRECT_AND_CHECKED).hasClass('radio-on')).to.equal(true);
        expect(charCount($(LABEL_CORRECT_AND_CHECKED).text())).to.be.above(0);
        expect($(LABEL_CORRECT_AND_CHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_OFF);
      });

      it('QCU, la réponse correcte n\'est pas cochée', function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(RADIO_CORRECT_AND_CHECKED).hasClass('radio-off')).to.equal(true);

        expect(charCount($(LABEL_CORRECT_AND_UNCHECKED).text())).to.be.above(0);
        expect($(LABEL_CORRECT_AND_UNCHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_OFF);
      });

      it('QCU, la réponse incorrecte n\'est pas cochée', function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(RADIO_INCORRECT_AND_UNCHECKED).hasClass('radio-off')).to.equal(true);
        expect(charCount($(LABEL_INCORRECT_AND_UNCHECKED).text())).to.be.above(0);
        expect($(LABEL_INCORRECT_AND_UNCHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_OFF);
      });

      it('QCU,la réponse incorrecte est cochée', function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(RADIO_INCORRECT_AND_CHECKED).hasClass('radio-on')).to.equal(true);
        expect(charCount($(LABEL_INCORRECT_AND_CHECKED).text())).to.be.above(0);
        expect($(LABEL_INCORRECT_AND_CHECKED).css('text-decoration')).to.contain(CSS_LINETHROUGH_ON);
      });

      it('Aucune case à cocher n\'est cliquable', function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        const size = $('.comparison-window .qcu-panel__proposal-radio').length;
        _.times(size, function(index) {
          expect($('.comparison-window .qcu-panel__proposal-radio:eq(' + index + ')').is(':disabled')).to.equal(true);
        });
      });
    });
  });
});
