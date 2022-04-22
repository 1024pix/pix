import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
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
    expect(find('a.pix-button--background-grey')).to.exist;
    expect(find('a.pix-button--background-grey')).to.have.property('textContent').that.contains('Recommandés');
    expect(find('a.pix-button--background-transparent-light')).to.exist;
    expect(find('a.pix-button--background-transparent-light'))
      .to.have.property('textContent')
      .that.contains('Enregistrés');
  });
});
