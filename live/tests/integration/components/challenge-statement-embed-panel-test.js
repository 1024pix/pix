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

  it('renders', function() {
    this.render(hbs`{{challenge-statement-embed-panel}}`);
    expect(this.$()).to.have.length(1);
  });

  it('should reload iframe when user clicked on button reload', async function() {
    // given
    const stubReloadIframe = sinon.stub();
    this.set('stubReloadIframe', stubReloadIframe);
    this.render(hbs`{{challenge-statement-embed-panel _reloadIframe=stubReloadIframe}}`);

    // when
    run(() => document.querySelector('.challenge-statement-embed-panel__reload-button').click());

    // then
    sinon.assert.calledOnce(stubReloadIframe);
  });
});
