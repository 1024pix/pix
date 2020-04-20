import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Challenge Embed Simulator', function() {

  setupRenderingTest();

  describe('Acknowledgment overlay', function() {

    it('should be displayed when component has just been rendered', async function() {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__acknowledgment-overlay')).to.exist;
    });

    it('should contain a button to launch the simulator', async function() {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__acknowledgment-overlay .embed__launch-simulator-button')).to.exist;
    });
  });

  describe('Launch simulator button', () => {

    it('should have text "Je lance le simulateur"', async function() {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__acknowledgment-overlay .embed__launch-simulator-button').textContent).to.equal('Je lance l’application');
    });

    it('should close the acknowledgment overlay when clicked', async function() {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await click('.embed__launch-simulator-button');

      // then
      expect(find('.embed__acknowledgment-overlay')).to.not.exist;
    });
  });

  describe('Reload simulator button', () => {

    it('should have text "Réinitialiser"', async function() {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__reboot').textContent.trim()).to.equal('Réinitialiser');
    });
  });

  describe('Blur effect on simulator panel', function() {

    it('should be active when component is first rendered', async function() {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__simulator').classList.contains('blurred')).to.be.true;
    });

    it('should be removed when simulator was launched', async function() {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await click('.embed__launch-simulator-button');

      // then
      expect(find('.embed__simulator').classList.contains('blurred')).to.be.false;
    });
  });

  describe('Embed simulator', function() {

    beforeEach(async function() {
      // given
      this.set('embedDocument', {
        url: 'http://embed-simulator.url',
        title: 'Embed simulator',
        height: 200
      });

      // when
      await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
    });

    it('should have an height that is the one defined in the referential', function() {
      expect(find('.challenge-embed-simulator').style.cssText).to.equal('height: 200px;');
    });

    it('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', function() {
      expect(find('.embed__iframe').title).to.equal('Embed simulator');
    });

    it('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', function() {
      expect(find('.embed__iframe').src).to.equal('http://embed-simulator.url/');
    });
  });

});
