import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import times from 'lodash/times';
import config from '../../../config/environment';

const assessment = {};
let challenge = null;
let answer = null;
let solution = null;
let solutionAsText = null;

describe('Integration | Component | qcu-solution-panel.js', function() {
  setupIntlRenderingTest();

  const correctAnswer = {
    id: 'answer_id', assessment, challenge, value: '2',
  };

  const unCorrectAnswer = {
    id: 'answer_id', assessment, challenge, value: '3',
  };

  context('When toggle for improving wrong answers display is true', function() {

    let configurationForImprovingDisplayForWrongAnswers;

    before(function() {
      configurationForImprovingDisplayForWrongAnswers = config.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU;
      config.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU = true;
    });

    after(function() {
      config.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU = configurationForImprovingDisplayForWrongAnswers;
    });

    it('Should render', async function() {
      await render(hbs`<QcuSolutionPanel/>`);
      expect(find('.qcu-solution-panel')).to.exist;
    });

    describe('Radio state', function() {

      before(function() {
        challenge = EmberObject.create({
          id: 'challenge_id',
          proposals: '-foo\n- bar\n- qix\n- yon',
          type: 'QCU',
        });

        solution = '2';

        answer = {
          id: 'answer_id',
          assessment,
          challenge,
          value: '2',
        };
      });

      it('Should display only user answer', async function() {
        // Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);
        // When
        await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        expect(findAll('[data-goodness=good]').length).to.equal(1);
      });

      it('should not be editable', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        times(findAll('.comparison-window .qcu-solution-panel__radio-button').length, function(index) {
          expect(find('.comparison-window .qcu-solution-panel__radio-button:eq(' + index + ')').getAttribute('disabled')).to.equal('disabled');
        });
      });
    });

    describe('When answer is correct', function() {

      before(function() {
        challenge = EmberObject.create({
          id: 'challenge_id',
          proposals: '-foo\n- bar\n- qix\n- yon',
          type: 'QCU',
        });

        solution = '2';
      });

      it('should inform that the answer is correct', async function() {
        //Given
        this.set('answer', correctAnswer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        expect(find('.answer-feedback__correct-answer')).to.exist;
      });
    });

    describe('When answer is wrong', function() {
      before(function() {
        challenge = EmberObject.create({
          id: 'challenge_id',
          proposals: '-foo\n- bar\n- qix\n- yon',
          type: 'QCU',
        });

        solution = '2';
        solutionAsText = 'bar';
      });

      it('should inform that the answer is wrong', async function() {
        //Given
        this.set('answer', unCorrectAnswer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        expect(find('.answer-feedback__wrong-answer')).to.exist;
      });

      it('should inform the user of the correct answer', async function() {
        // Given
        this.set('answer', unCorrectAnswer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        const correctAnswer = find('.wrong-answer__expected-answer');
        expect(correctAnswer).to.exist;
        expect(correctAnswer.innerText).to.equal(solutionAsText);
      });
    });
  });

  context('When toggle for improving wrong answers display is false', function() {
    describe('#Component should render: ', function() {

      let configurationForImprovingDisplayForWrongAnswers;

      before(function() {
        configurationForImprovingDisplayForWrongAnswers = config.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU;
        config.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU = false;
      });

      after(function() {
        config.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU = configurationForImprovingDisplayForWrongAnswers;
      });

      it('Should render', async function() {
        await render(hbs`<QcuSolutionPanel/>`);
        expect(find('.qcu-solution-panel')).to.exist;
        expect(findAll('.qcu-solution-panel__proposition')).to.have.lengthOf(0);
      });

      describe('Radio state', function() {

        before(function() {
          challenge = EmberObject.create({
            id: 'challenge_id',
            proposals: '-foo\n- bar\n- qix\n- yon',
            type: 'QCM',
          });

          solution = '2';

          answer = EmberObject.create(correctAnswer);
        });

        it('QCU,la réponse correcte est cochée', async function() {
          //Given
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('challenge', challenge);
          // When
          await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

          // Then
          expect(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked')).to.equal('yes');
          expect(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness')).to.equal('good');
          expect(findAll('.qcu-solution-panel__radio-button')[1].innerHTML).to.contains('Votre réponse');
        });

        it('QCU, la réponse correcte n\'est pas cochée', async function() {
          //Given
          answer = EmberObject.create(unCorrectAnswer);

          this.set('answer', answer);
          this.set('solution', solution);
          this.set('challenge', challenge);

          // When
          await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

          // Then
          expect(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked')).to.equal('no');
          expect(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness')).to.equal('good');
          expect(findAll('.qcu-solution-panel__radio-button')[1].innerHTML).to.contains('Autre proposition');
        });

        it('QCU, la réponse incorrecte n\'est pas cochée', async function() {
          //Given
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('challenge', challenge);

          // When
          await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

          // Then
          expect(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-checked')).to.equal('no');
          expect(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-goodness')).to.equal('bad');
          expect(findAll('.qcu-solution-panel__radio-button')[0].innerHTML).to.contains('Autre proposition');
        });

        it('QCU,la réponse incorrecte est cochée', async function() {
          //Given
          answer = EmberObject.create(unCorrectAnswer);

          this.set('answer', answer);
          this.set('solution', solution);
          this.set('challenge', challenge);

          // When
          await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

          // Then
          expect(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-checked')).to.equal('yes');
          expect(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-goodness')).to.equal('bad');
          expect(findAll('.qcu-solution-panel__radio-button')[2].innerHTML).to.contains('Votre réponse');
        });

        it('Aucune case à cocher n\'est cliquable', async function() {
          //Given
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('challenge', challenge);

          // When
          await render(hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

          // Then
          times(findAll('.comparison-window .qcu-solution-panel__radio-button').length, function(index) {
            expect(find('.comparison-window .qcu-solution-panel__radio-button:eq(' + index + ')').getAttribute('disabled')).to.equal('disabled');
          });
        });
      });
    });
  });
});
