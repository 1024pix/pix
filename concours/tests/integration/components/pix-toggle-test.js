import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render , click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | pix-toggle', function() {
  setupRenderingTest();

  beforeEach(async function() {

    this.set('valueFirstLabel', 'valueFirstLabel');
    this.set('valueSecondLabel', 'valueSecondLabel');
    this.set('onToggle', function() {
      this.set('loginWithEmail', false);
    });
    this.set('isFirstOn', 'true');

    await render(hbs`{{pix-toggle onToggle=onToggle valueFirstLabel=valueFirstLabel valueSecondLabel=valueSecondLabel}}`);
  });

  it('Default Render',  function() {

    expect(find('.pix-toggle')).to.exist;

  });

  it('should display the toggle with on/off span', function() {
    expect(find('.pix-toggle__on')).to.exist;
    expect(find('.pix-toggle__off')).to.exist;
  });

  it('should display the toggle with on/off span with the correct values', function() {

    expect(find('.pix-toggle__on').nodeName).to.equal('SPAN');
    expect(find('.pix-toggle__off').nodeName).to.equal('SPAN');

    expect(find('.pix-toggle__on').textContent).to.equal('valueFirstLabel');
    expect(find('.pix-toggle__off').textContent).to.equal('valueSecondLabel');

  });

  it('should change the value of toggleOn when toggle off', async function() {

    await click('.pix-toggle__off');

    expect(find('.pix-toggle__on').textContent).to.equal('valueSecondLabel');
    expect(find('.pix-toggle__off').textContent).to.equal('valueFirstLabel');

    await click('.pix-toggle__off');

    expect(find('.pix-toggle__on').textContent).to.equal('valueFirstLabel');
    expect(find('.pix-toggle__off').textContent).to.equal('valueSecondLabel');

  });

});
