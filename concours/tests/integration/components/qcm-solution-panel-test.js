import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import _ from 'mon-pix/utils/lodash-custom';

const assessment = {};
let challenge = null;
let answer = null;
let solution = null;

describe('Integration | Component | qcm-solution-panel.js', function() {

  setupRenderingTest();

  describe('#Component should renders: ', function() {

    it('Should renders', async function() {
      await render(hbs`{{qcm-solution-panel}}`);

      expect(find('.qcm-solution-panel')).to.exist;
      expect(findAll('.qcm-proposal-label__oracle')).to.have.lengthOf(0);
    });

    describe('checkbox state', function() {
      const correctAnswer = {
        id: 'answer_id', assessment, challenge, value: '2,4'
      };

      const unCorrectAnswer = {
        id: 'answer_id', assessment, challenge, value: '1,4'
      };

      before(function() {
        challenge = EmberObject.create({
          id: 'challenge_id',
          proposals: '-foo\n- bar\n- qix\n- yon',
          type: 'QCM'
        });

        solution = '2,3';

        answer = EmberObject.create(correctAnswer);
      });

      it('QCM, la réponse correcte est cochée', async function() {
        // Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcm-proposal-label__oracle')[1].getAttribute('data-checked')).to.equal('yes');
        expect(findAll('input[type=checkbox]')[1].getAttribute('disabled')).to.equal('disabled');
        expect(findAll('.qcm-proposal-label__oracle')[1].getAttribute('data-goodness')).to.equal('good');
      });

      it('QCM, une réponse incorrecte n\'est pas cochée', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcm-proposal-label__oracle')[0].getAttribute('data-checked')).to.equal('no');
        expect(findAll('.qcm-proposal-label__oracle')[0].getAttribute('data-goodness')).to.equal('bad');
      });

      it('QCM, Au moins l\'une des réponses correctes n\'est pas cochée', async function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcm-proposal-label__oracle')[2].getAttribute('data-checked')).to.equal('no');
        expect(findAll('.qcm-proposal-label__oracle')[2].getAttribute('data-goodness')).to.equal('good');
      });

      it('QCM, au moins l\'une des réponses incorrectes est cochée', async function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        expect(findAll('.qcm-proposal-label__oracle')[0].getAttribute('data-checked')).to.equal('yes');
        expect(findAll('.qcm-proposal-label__oracle')[0].getAttribute('data-goodness')).to.equal('bad');
      });

      it('Aucune case à cocher n\'est cliquable', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`{{qcm-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // Then
        const size = findAll('.comparison-window .qcm-proposal-label__checkbox-picture').length;
        _.times(size, function(index) {
          expect(find('.comparison-window .qcm-proposal-label__checkbox-picture:eq(' + index + ')').getAttribute('disabled')).to.equal('disabled');
        });
      });
    });
  });
});
