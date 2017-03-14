import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import _ from 'pix-live/utils/lodash-custom';

const CHECKBOX_CORRECT_AND_CHECKED = '.qcm-panel__proposal-checkbox:eq(1)';
const LABEL_CORRECT_AND_CHECKED = '.qcm-proposal-label__oracle:eq(1)';

const CHECKBOX_CORRECT_AND_UNCHECKED = '.qcm-panel__proposal-checkbox:eq(2)';
const LABEL_CORRECT_AND_UNCHECKED = '.qcm-proposal-label__oracle:eq(2)';

const CHECKBOX_INCORRECT_AND_CHECKED = '.qcm-panel__proposal-checkbox:eq(3)';
const LABEL_INCORRECT_AND_CHECKED = '.qcm-proposal-label__oracle:eq(3)';

const CHECKBOX_INCORRECT_AND_UNCHECKED = '.qcm-panel__proposal-checkbox:eq(0)';
const LABEL_INCORRECT_AND_UNCHECKED = '.qcm-proposal-label__oracle:eq(0)';


const CSS_BOLD_FONT_WEIGHT = '900';
const CSS_NORMAL_FONT_WEIGHT = '400';

const CSS_GREEN_COLOR = 'rgb(19, 201, 160)';
const CSS_BLACK_COLOR = 'rgb(51, 51, 51)';

const CSS_LINETHROUGH_ON = 'line-through';
const CSS_LINETHROUGH_OFF = 'none';

let assessment = null;
let challenge = null;
let answer = null;
let solution = null;
let store = null;

function charCount(str) {
  return str.match(/[a-zA-Z]/g).length;
}


describe('Integration | Component | qcm-solution-panel.js', function () {
  setupComponentTest('qcm-solution-panel', {
    integration: true
  });

  describe('#Component should renders: ', function () {

    it('Should renders', function () {
      this.render(hbs`{{qcm-solution-panel}}`);
      expect(this.$()).to.have.length(1);
      expect($(LABEL_CORRECT_AND_CHECKED)).to.have.lengthOf(0);
    });

    describe('checkbox state', function () {

      before(function () {
        Ember.run(() => {
          store = this.container.lookup('service:store');

          // Given
          assessment = store.createRecord('assessment', {id: 'assessment_id'});
          challenge = store.createRecord('challenge', {
            id: 'challenge_id',
            proposals: '-foo\n- bar\n- qix\n- yon',
            type: 'QCM'
          });

          answer = store.createRecord('answer', {id: 'answer_id', assessment, challenge, value: '2,4'});
          solution = store.createRecord('solution', {id: 'solution_id', value: '2,3'});
        });
      });

      it('QCM correcte et cochée', function () {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);
        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(LABEL_CORRECT_AND_CHECKED)).to.have.lengthOf(1);
        expect($(CHECKBOX_CORRECT_AND_CHECKED)).to.have.lengthOf(1);

        expect($(CHECKBOX_CORRECT_AND_CHECKED).is(':checked')).to.equal(true);
        expect(charCount($(LABEL_CORRECT_AND_CHECKED).text())).to.be.above(0);
        expect($(LABEL_CORRECT_AND_CHECKED).css('font-weight')).to.equal(CSS_BOLD_FONT_WEIGHT);
        expect($(LABEL_CORRECT_AND_CHECKED).css('color')).to.equal(CSS_GREEN_COLOR);
        expect($(LABEL_CORRECT_AND_CHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_OFF);
      });

      it('QCM correcte et non cochée', function () {

        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(CHECKBOX_CORRECT_AND_UNCHECKED).is(':checked')).to.equal(false);
        expect(charCount($(LABEL_CORRECT_AND_UNCHECKED).text())).to.be.above(0);
        expect($(LABEL_CORRECT_AND_UNCHECKED).css('font-weight')).to.equal(CSS_BOLD_FONT_WEIGHT);
        expect($(LABEL_CORRECT_AND_UNCHECKED).css('color')).to.equal(CSS_GREEN_COLOR);
        expect($(LABEL_CORRECT_AND_UNCHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_OFF);
      });

      it('QCM incorrecte et cochée', function () {

        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(CHECKBOX_INCORRECT_AND_CHECKED).is(':checked')).to.equal(true);
        expect(charCount($(LABEL_INCORRECT_AND_CHECKED).text())).to.be.above(0);
        expect($(LABEL_INCORRECT_AND_CHECKED).css('font-weight')).to.equal(CSS_NORMAL_FONT_WEIGHT);
        expect($(LABEL_INCORRECT_AND_CHECKED).css('color')).to.equal(CSS_BLACK_COLOR);
        expect($(LABEL_INCORRECT_AND_CHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_ON);

      });

      it('QCM incorrecte et non cochée', function(){
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect($(CHECKBOX_INCORRECT_AND_UNCHECKED).is(':checked')).to.equal(false);
        expect(charCount($(LABEL_INCORRECT_AND_UNCHECKED).text())).to.be.above(0);
        expect($(LABEL_INCORRECT_AND_UNCHECKED).css('font-weight')).to.equal(CSS_NORMAL_FONT_WEIGHT);
        expect($(LABEL_INCORRECT_AND_UNCHECKED).css('color')).to.equal(CSS_BLACK_COLOR);
        expect($(LABEL_INCORRECT_AND_UNCHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_OFF);
      });

      it('Aucune case à cocher n\'est cliquable', function(){
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        this.render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        const size = $('.comparison-window .qcm-panel__proposal-checkbox').length;
        _.times(size, function(index) {
          expect($('.comparison-window .qcm-panel__proposal-checkbox:eq('+ index + ')').is(':disabled')).to.equal(true);
        });
      });


    });


  });

});
