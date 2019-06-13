import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import _ from 'mon-pix/utils/lodash-custom';

const assessment = {};
let challenge = null;
let answer = null;
let solution = null;

describe('Integration | Component | qcu-solution-panel.js', function() {
  setupRenderingTest();

  const correctAnswer = {
    id: 'answer_id', assessment, challenge, value: '2'
  };

  const unCorrectAnswer = {
    id: 'answer_id', assessment, challenge, value: '3'
  };

  describe('#Component should renders: ', function() {

    it('Should renders', async function() {
      await render(hbs`{{qcu-solution-panel}}`);
      expect(find('.qcu-solution-panel')).to.exist;
      expect(findAll('.qcu-proposal-label__oracle')).to.have.lengthOf(0);
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

      it('QCU,la réponse correcte est cochée', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);
        // When
        await render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcu-proposal-label__oracle')[1].getAttribute('data-checked')).to.equal('yes');
        expect(findAll('.qcu-proposal-label__oracle')[1].getAttribute('data-goodness')).to.equal('good');
        expect(findAll('.picture-radio-proposal--qcu')[1].classList.contains('radio-on')).to.equal(true);
      });

      it('QCU, la réponse correcte n\'est pas cochée', async function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcu-proposal-label__oracle')[1].getAttribute('data-checked')).to.equal('no');
        expect(findAll('.qcu-proposal-label__oracle')[1].getAttribute('data-goodness')).to.equal('good');
        expect(findAll('.picture-radio-proposal--qcu')[1].classList.contains('radio-off')).to.equal(true);
      });

      it('QCU, la réponse incorrecte n\'est pas cochée', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcu-proposal-label__oracle')[0].getAttribute('data-checked')).to.equal('no');
        expect(findAll('.qcu-proposal-label__oracle')[0].getAttribute('data-goodness')).to.equal('bad');
        expect(findAll('.picture-radio-proposal--qcu')[0].classList.contains('radio-off')).to.equal(true);
      });

      it('QCU,la réponse incorrecte est cochée', async function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcu-proposal-label__oracle')[2].getAttribute('data-checked')).to.equal('yes');
        expect(findAll('.qcu-proposal-label__oracle')[2].getAttribute('data-goodness')).to.equal('bad');
        expect(findAll('.picture-radio-proposal--qcu')[2].classList.contains('radio-on')).to.equal(true);
      });

      it('Aucune case à cocher n\'est cliquable', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcu-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        _.times(findAll('.comparison-window .qcu-panel__proposal-radio').length, function(index) {
          expect(find('.comparison-window .qcu-panel__proposal-radio:eq(' + index + ')').getAttribute('disabled')).to.equal('disabled');
        });
      });
    });
  });
});
