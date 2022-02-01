import { find, render } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import { expect } from 'chai';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | Challenge | Item', function () {
  setupIntlRenderingTest();

  it('should render', async function () {
    // given
    this.set('challenge', {
      type: 'QROC',
      timer: false,
      format: 'phrase',
      proposals: '${myInput}',
    });
    this.set('answer', {});

    // when
    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @answer={{this.answer}} />`);

    // then
    expect(find('.challenge-item')).to.exist;
  });
});
