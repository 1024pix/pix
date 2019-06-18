import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | trophy item', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{trophy-item}}`);
    expect(find('.trophy-item')).to.exist;
  });

  it('should contain the level passed in the component', async function() {
    // given
    const level = 3;
    this.set('level', level);

    // when
    await render(hbs`{{trophy-item level=level}}`);

    // then
    expect(find('.trophy-item__level').textContent).to.contain(level.toString());
  });

  it('should contain an image of a trophy with the text "NIVEAU"', async function() {
    // when
    await render(hbs`{{trophy-item}}`);

    // then
    expect(findAll('.trophy-item__img').length).to.equal(1);
    expect(find('.trophy-item__level').textContent).to.contain('NIVEAU');
  });
});
