import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { run } from '@ember/runloop';

describe('Integration | Component | challenge statement embed panel', function() {

  setupComponentTest('challenge-statement-embed-panel', {
    integration: true
  });

  describe('Aknowledgment overlay', function() {

    it('should be displayed when component has just been rendered', function() {
      // when
      this.render(hbs`{{challenge-statement-embed-panel}}`);

      // then
      expect(this.$('.challenge-statement-embed-panel__aknowledgment-overlay')).to.have.lengthOf(1);
    });

    it('should contain a button to launch the simulator', function() {
      // when
      this.render(hbs`{{challenge-statement-embed-panel}}`);

      // then
      const $launchSimulatorButton = this.$('.challenge-statement-embed-panel__aknowledgment-overlay .challenge-statement-embed-panel__launch-simulator-button');
      expect($launchSimulatorButton).to.have.lengthOf(1);
    });
  });

  describe('Launch simulator button', () => {

    it('should have text "Je lance le simulateur"', function() {
      // when
      this.render(hbs`{{challenge-statement-embed-panel}}`);

      // then
      const $launchSimulatorButton = this.$('.challenge-statement-embed-panel__aknowledgment-overlay .challenge-statement-embed-panel__launch-simulator-button');
      expect($launchSimulatorButton.text().trim()).to.equal('Je lance le simulateur');
    });

    it('should close the aknowledgment overlay when clicked', async function() {
      // given
      this.render(hbs`{{challenge-statement-embed-panel}}`);

      // when
      run(() => document.querySelector('.challenge-statement-embed-panel__launch-simulator-button').click());

      // then
      expect(this.$('.challenge-statement-embed-panel__aknowledgment-overlay')).to.have.lengthOf(0);
    });
  });

  describe('Reload simulator button', () => {

    it('should have text "Recharger le simulateur"', function() {
      // when
      this.render(hbs`{{challenge-statement-embed-panel}}`);

      // then
      const $reloadSimulatorButton = this.$('.challenge-statement-embed-panel__reload-button');
      expect($reloadSimulatorButton.text().trim()).to.equal('Recharger le simulateur');
    });

    it('should reload simulator when user clicked on button reload', async function() {
      // given
      const stubReloadSimulator = sinon.stub();
      this.set('stubReloadSimulator', stubReloadSimulator);
      this.render(hbs`{{challenge-statement-embed-panel _reloadSimulator=stubReloadSimulator}}`);

      // when
      run(() => document.querySelector('.challenge-statement-embed-panel__reload-button').click());

      // then
      sinon.assert.calledOnce(stubReloadSimulator);
    });
  });

  describe('Blur effect on simulator panel', function() {

    it('should be active when component is first rendered', function() {
      // when
      this.render(hbs`{{challenge-statement-embed-panel}}`);

      // then
      const $simulator = this.$('.challenge-statement-embed-panel__simulator')[0];
      expect($simulator.classList.contains('blurred')).to.be.true;
    });

    it('should be removed when simulator was launched', function() {
      // given
      this.render(hbs`{{challenge-statement-embed-panel}}`);

      // when
      run(() => document.querySelector('.challenge-statement-embed-panel__launch-simulator-button').click());

      // then
      const $simulator = this.$('.challenge-statement-embed-panel__simulator')[0];
      expect($simulator.classList.contains('blurred')).to.be.false;
    });
  });
});
