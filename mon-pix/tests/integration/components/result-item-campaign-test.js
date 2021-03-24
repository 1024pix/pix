import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | result-item', function() {

  setupIntlRenderingTest();

  describe('Component rendering', function() {

    const providedChallengeInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir [plusieurs](http://link.plusieurs.url)';

    const emberChallengeObject = EmberObject.create({
      type: 'QCM',
      instruction: providedChallengeInstruction,
      proposals: '- soit possibilite A, et/ou' +
      '\n - soit possibilite B, et/ou' +
      '\n - soit possibilite C, et/ou' +
      '\n - soit possibilite D',
    });

    const answer = EmberObject.create({
      value: '2,4',
      result: 'ko',
      id: 1,
      challenge: emberChallengeObject,
      assessment: {
        id: 4,
      },
    });

    beforeEach(function() {
      this.set('index', 0);
      return this.set('openComparisonWindow', () => {});
    });

    it('should exist', async function() {
      // given
      this.set('answer', '');

      // when
      await render(hbs`<ResultItem @answer={{this.answer}} />`);

      // then
      expect(find('.result-item')).to.exist;
    });

    it('should render the challenge instruction', async function() {
      // given
      this.set('answer', answer);

      // when
      await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails=(action openComparisonWindow)/>`);

      // then
      const expectedChallengeInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs';
      expect(find('.result-item__instruction').textContent.trim()).to.equal(expectedChallengeInstruction);
    });

    it('should render a button when QCM', async function() {
      // given
      this.set('answer', answer);

      await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails=(action openComparisonWindow)/>`);
      // Then
      expect(find('.result-item__correction-button').textContent.trim()).to.deep.equal('Réponses et tutos');
    });

    it('should render a tooltip with an image', async function() {
      // given
      this.set('answer', answer);

      // when
      await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails=(action openComparisonWindow)/>`);

      // Then
      expect(find('result-item__icon-img'));
    });

    [
      { status: 'ok', color: 'green' },
      { status: 'ko', color: 'red' },
      { status: 'aband', color: 'grey' },
      { status: 'partially', color: 'orange' },
      { status: 'timedout', color: 'red' },
    ].forEach((data) => {

      it(`should display a relevant result icon when the result of the answer is "${data.status}"`, async function() {
        // given
        answer.set('result', data.status);
        this.set('answer', answer);

        // when
        await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails=(action openComparisonWindow)/>`);

        // then
        expect(find(`.result-item__icon--${data.color}`)).to.exist;
      });
    });
  });
});
