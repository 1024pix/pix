import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | medal item', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{medal-item}}`);
    expect(find('.medal-item')).to.exist;
  });

  it('should contain the number of pix passed in the component', async function() {
    // given
    const pixScore = 20;
    this.set('pixScore', pixScore);

    // when
    await render(hbs`{{medal-item pixScore=pixScore}}`);

    // then
    expect(find('.medal-item__pix-score').textContent).to.contain(pixScore.toString());
  });

  it('should contain an image of a medal with the text pix', async function() {
    // when
    await render(hbs`{{medal-item pixScore=pixScore}}`);

    // then
    expect(findAll('.medal-item__medal-img').length).to.equal(1);
    expect(find('.medal-item__pix-score').textContent).to.contain('pix');
  });
});
