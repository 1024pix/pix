import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { run } from '@ember/runloop';

describe('Integration | Component | challenge embed simulator', function() {

  setupComponentTest('challenge-embed-simulator', {
    integration: true
  });

  describe('Aknowledgment overlay', function() {

    it('should be displayed when component has just been rendered', function() {
      // when
      this.render(hbs`{{challenge-embed-simulator}}`);

      // then
      expect(this.$('.challenge-embed-simulator__aknowledgment-overlay')).to.have.lengthOf(1);
    });

    it('should contain a button to launch the simulator', function() {
      // when
      this.render(hbs`{{challenge-embed-simulator}}`);

      // then
      const $launchSimulatorButton = this.$('.challenge-embed-simulator__aknowledgment-overlay .challenge-embed-simulator__launch-simulator-button');
      expect($launchSimulatorButton).to.have.lengthOf(1);
    });
  });

  describe('Launch simulator button', () => {

    it('should have text "Je lance le simulateur"', function() {
      // when
      this.render(hbs`{{challenge-embed-simulator}}`);

      // then
      const $launchSimulatorButton = this.$('.challenge-embed-simulator__aknowledgment-overlay .challenge-embed-simulator__launch-simulator-button');
      expect($launchSimulatorButton.text().trim()).to.equal('Je lance l’application');
    });

    it('should close the aknowledgment overlay when clicked', async function() {
      // given
      this.render(hbs`{{challenge-embed-simulator}}`);

      // when
      run(() => document.querySelector('.challenge-embed-simulator__launch-simulator-button').click());

      // then
      expect(this.$('.challenge-embed-simulator__aknowledgment-overlay')).to.have.lengthOf(0);
    });
  });

  describe('Reload simulator button', () => {

    it('should have text "Recharger le simulateur"', function() {
      // when
      this.render(hbs`{{challenge-embed-simulator}}`);

      // then
      const $reloadSimulatorButton = this.$('.challenge-embed-simulator__reload-button');
      expect($reloadSimulatorButton.text().trim()).to.equal('Recharger l’application');
    });

    it('should reload simulator when user clicked on button reload', async function() {
      // given
      const stubReloadSimulator = sinon.stub();
      this.set('stubReloadSimulator', stubReloadSimulator);
      this.render(hbs`{{challenge-embed-simulator _reloadSimulator=stubReloadSimulator}}`);

      // when
      run(() => document.querySelector('.challenge-embed-simulator__reload-button').click());

      // then
      sinon.assert.calledOnce(stubReloadSimulator);
    });
  });

  describe('Blur effect on simulator panel', function() {

    it('should be active when component is first rendered', function() {
      // when
      this.render(hbs`{{challenge-embed-simulator}}`);

      // then
      const $simulator = this.$('.challenge-embed-simulator__simulator')[0];
      expect($simulator.classList.contains('blurred')).to.be.true;
    });

    it('should be removed when simulator was launched', function() {
      // given
      this.render(hbs`{{challenge-embed-simulator}}`);

      // when
      run(() => document.querySelector('.challenge-embed-simulator__launch-simulator-button').click());

      // then
      const $simulator = this.$('.challenge-embed-simulator__simulator')[0];
      expect($simulator.classList.contains('blurred')).to.be.false;
    });
  });

  describe('Embed simulator', function() {

    const embedDocument = {
      url: 'http://embed-simulator.url',
      title: 'Embed simulator',
      height: 200
    };

    beforeEach(function() {
      // given
      this.set('embedDocument', embedDocument);

      // when
      this.render(hbs`{{challenge-embed-simulator embedDocument=embedDocument}}`);

      // then
    });

    it('should have an height that is the one defined in the referential', function() {
      expect(this.$('.challenge-embed-simulator')[0].style.cssText).to.equal('height: 200px;');
    });

    it('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', function() {
      expect(this.$('.challenge-embed-simulator__iframe')[0].title).to.equal('Embed simulator');
    });

    it('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', function() {
      expect(this.$('.challenge-embed-simulator__iframe')[0].src).to.equal('http://embed-simulator.url/');
    });
  });

});
