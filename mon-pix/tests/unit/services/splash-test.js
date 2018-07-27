import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

function createSplash() {
  const splash = document.createElement('div');
  splash.setAttribute('id', 'app-splash');
  document.body.appendChild(splash);
}

function removeSplash() {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.parentNode.removeChild(splash);
  }
}

function hasSplash() {
  return document.getElementById('app-splash') != null;
}

describe('Unit | Service | splash', function() {
  setupTest('service:splash');

  describe('#hide', function() {
    context('when a splash is present in the DOM', function() {
      it('removes the splash from the DOM', function() {
        // Given
        const splash = this.subject();
        createSplash();
        expect(hasSplash()).to.be.true;
        // When
        splash.hide();
        // Then
        expect(hasSplash()).to.be.false;
      });
    });

    context('when there is no splash', function() {
      it('does nothing', function() {
        // Given
        const splash = this.subject();
        expect(hasSplash()).to.be.false;
        // When
        splash.hide();
        // Then
        expect(hasSplash()).to.be.false;
      });
    });

    afterEach(function() {
      removeSplash();
    });
  });
});
