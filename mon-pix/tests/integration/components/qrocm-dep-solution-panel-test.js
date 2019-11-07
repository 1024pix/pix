import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QROC proposal', function() {

  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{qrocm-dep-solution-panel}}`);
    expect(find('.qrocm-solution-panel')).to.exist;
  });

  describe('When format is a paragraph', function() {
    const challenge = EmberObject.create({
      id: 'challenge_id',
      proposals: 'answer1 : ${key1}\nCarte mémoire (SD) : ${key2}\nblabla : ${key3}',
      format: 'paragraphe'
    });
    const answer = EmberObject.create({
      id: 'answer_id',
      value: 'key1: \'rightAnswer1\' key2: \'wrongAnswer2\' key3: \'\'',
      challenge
    });

    it('should display a disabled textarea', async function() {
      // given
      this.set('challenge', challenge);
      this.set('answer', answer);

      // when
      await render(hbs`{{qrocm-dep-solution-panel answer=answer challenge=challenge}}`);

      // then
      expect(find('.correction-qrocm__answer-input')).to.not.exist;
      expect(find('.correction-qrocm__answer-textarea').tagName).to.equal('TEXTAREA');
      expect(find('.correction-qrocm__answer-textarea').hasAttribute('disabled')).to.be.true;
    });
  });

  describe('When format is not a paragraph', function() {

    [
      { format: 'petit', expectedSize: '5' },
      { format: 'mots', expectedSize: '15' },
      { format: 'phrase', expectedSize: '50' },
      { format: 'unreferenced_format', expectedSize: '15' }
    ].forEach((data) => {
      const challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: 'answer1 : ${key1}\nCarte mémoire (SD) : ${key2}\nblabla : ${key3}',
        format: data.format
      });
      const answer = EmberObject.create({
        id: 'answer_id',
        value: 'key1: \'rightAnswer1\' key2: \'wrongAnswer2\' key3: \'\'',
        challenge
      });
      it(`should display a disabled input with expected size (${data.expectedSize}) when format is ${data.format}`, async function() {
        // given
        this.set('challenge', challenge);
        this.set('answer', answer);

        // when
        await render(hbs`{{qrocm-dep-solution-panel answer=answer challenge=challenge}}`);

        // then
        expect(find('.correction-qrocm__answer-textarea')).to.not.exist;
        expect(find('.correction-qrocm__answer-input').tagName).to.equal('INPUT');
        expect(find('.correction-qrocm__answer-input').getAttribute('size')).to.equal(data.expectedSize);
      });
    });
  });

});
