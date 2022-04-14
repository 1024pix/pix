import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | chips-choice', function () {
  setupIntlRenderingTest();

  it('renders', async function () {
    //when
    await render(hbs`<ChipsChoice>Test</ChipsChoice>`);

    //then
    expect(find('.choice-chip')).to.exist;
  });

  it("should have disabled class when 'isDisabled' is true", async function () {
    // when
    await render(hbs`<ChipsChoice @isDisabled=true>Test</ChipsChoice>`);

    // then
    expect(find('.choice-chip--disabled')).to.exist;
  });
});
