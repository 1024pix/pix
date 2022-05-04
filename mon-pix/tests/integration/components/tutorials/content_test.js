import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import Service from '@ember/service';

describe('Integration | Component | Tutorials | Header', function () {
  setupIntlRenderingTest();

  beforeEach(function () {
    class RouterStub extends Service {
      currentRouteName = 'user-tutorials.recommended';
    }
    this.owner.register('service:router', RouterStub);
  });

  it('renders the header', async function () {
    // when
    await render(hbs`<Tutorials::Header />`);

    // then
    expect(find('.user-tutorials-banner-v2__title')).to.exist;
    expect(find('.user-tutorials-banner-v2__description')).to.exist;
    expect(find('.user-tutorials-banner-v2__filters')).to.exist;
    expect(findAll('a.pix-choice-chip')).to.have.lengthOf(2);
    expect(find('a.pix-choice-chip,a.pix-choice-chip--active')).to.exist;
    expect(find('a.pix-choice-chip,a.pix-choice-chip--active'))
      .to.have.property('textContent')
      .that.contains('Recommandés');
  });
});
