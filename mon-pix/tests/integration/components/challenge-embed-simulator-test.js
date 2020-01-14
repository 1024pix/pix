import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | challenge embed simulator', function() {

  setupRenderingTest();

  describe('Aknowledgment overlay', function() {

    it('should be displayed when component has just been rendered', async function() {
      // when
      await render(hbs`{{challenge-embed-simulator}}`);

      // then
      expect(find('.embed__acknowledgment-overlay')).to.exist;
    });

    it('should contain a button to launch the simulator', async function() {
      // when
      await render(hbs`{{challenge-embed-simulator}}`);

      // then
      expect(find('.embed__acknowledgment-overlay .embed__launch-simulator-button')).to.exist;
    });
  });

  describe('Launch simulator button', () => {

    it('should have text "Je lance le simulateur"', async function() {
      // when
      await render(hbs`{{challenge-embed-simulator}}`);

      // then
      expect(find('.embed__acknowledgment-overlay .embed__launch-simulator-button').textContent).to.equal('Je lance l’application');
    });

    it('should close the aknowledgment overlay when clicked', async function() {
      // given
      await render(hbs`{{challenge-embed-simulator}}`);

      // when
      await click('.embed__launch-simulator-button');

      // then
      expect(find('.embed__acknowledgment-overlay')).to.not.exist;
    });
  });

  describe('Reload simulator button', () => {

    it('should have text "Recharger le simulateur"', async function() {
      // when
      await render(hbs`{{challenge-embed-simulator}}`);

      // then
      expect(find('.embed__reload-simulator').textContent).to.equal('Recharger l’application');
    });

    it('should reload simulator when user clicked on button reload', async function() {
      // given
      const stubReloadSimulator = sinon.stub();
      this.set('stubReloadSimulator', stubReloadSimulator);
      await render(hbs`{{challenge-embed-simulator _reloadSimulator=stubReloadSimulator}}`);

      // when
      await click('.embed__reload-simulator');

      // then
      sinon.assert.calledOnce(stubReloadSimulator);
    });
  });

  describe('Blur effect on simulator panel', function() {

    it('should be active when component is first rendered', async function() {
      // when
      await render(hbs`{{challenge-embed-simulator}}`);

      // then
      expect(findAll('.embed__simulator')[0].classList.contains('blurred')).to.be.true;
    });

    it('should be removed when simulator was launched', async function() {
      // given
      await render(hbs`{{challenge-embed-simulator}}`);

      // when
      await click('.embed__launch-simulator-button');

      // then
      expect(findAll('.embed__simulator')[0].classList.contains('blurred')).to.be.false;
    });
  });

  describe('Embed simulator', function() {

    const embedDocument = {
      url: 'http://embed-simulator.url',
      title: 'Embed simulator',
      height: 200
    };

    beforeEach(async function() {
      // given
      this.set('embedDocument', embedDocument);

      // when
      await render(hbs`{{challenge-embed-simulator embedDocument=embedDocument}}`);

      // then
    });

    it('should have an height that is the one defined in the referential', function() {
      expect(findAll('.challenge-embed-simulator')[0].style.cssText).to.equal('height: 200px;');
    });

    it('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', function() {
      expect(findAll('.embed__iframe')[0].title).to.equal('Embed simulator');
    });

    it('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', function() {
      expect(findAll('.embed__iframe')[0].src).to.equal('http://embed-simulator.url/');
    });
  });

});
