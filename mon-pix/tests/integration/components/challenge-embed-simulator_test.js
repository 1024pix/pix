import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';

describe('Integration | Component | Challenge Embed Simulator', function () {
  setupIntlRenderingTest();

  describe('Acknowledgment overlay', function () {
    it('should be displayed when component has just been rendered', async function () {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__acknowledgment-overlay')).to.exist;
    });
  });

  describe('Launch simulator button', function () {
    it('should have text "Je lance l\'application"', async function () {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(contains(this.intl.t('pages.challenge.embed-simulator.actions.launch')));
    });

    it('should close the acknowledgment overlay when clicked', async function () {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await clickByLabel(this.intl.t('pages.challenge.embed-simulator.actions.launch'));

      // then
      expect(find('.embed__acknowledgment-overlay')).to.not.exist;
    });
  });

  describe('Reload simulator button', function () {
    it('should have text "Réinitialiser"', async function () {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__reboot').textContent.trim()).to.equal('Réinitialiser');
    });
  });

  describe('Blur effect on simulator panel', function () {
    it('should be active when component is first rendered', async function () {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      expect(find('.embed__simulator').classList.contains('blurred')).to.be.true;
    });

    it('should be removed when simulator was launched', async function () {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await clickByLabel(this.intl.t('pages.challenge.embed-simulator.actions.launch'));

      // then
      expect(find('.embed__simulator').classList.contains('blurred')).to.be.false;
    });
  });

  describe('Embed simulator', function () {
    beforeEach(async function () {
      // given
      this.set('embedDocument', {
        url: 'http://embed-simulator.url',
        title: 'Embed simulator',
        height: 200,
      });

      // when
      await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
    });

    it('should have an height that is the one defined in the referential', function () {
      expect(find('.challenge-embed-simulator').style.cssText).to.equal('height: 200px;');
    });

    it('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', function () {
      expect(find('.embed__iframe').title).to.equal('Embed simulator');
    });

    it('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', function () {
      expect(find('.embed__iframe').src).to.equal('http://embed-simulator.url/');
    });
  });
});
