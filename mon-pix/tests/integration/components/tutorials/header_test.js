import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

describe('Integration | Component | Tutorials | Header', function () {
  setupIntlRenderingTest();

  beforeEach(function () {
    class RouterStub extends Service {
      currentRouteName = 'authenticated.user-tutorials.recommended';
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

  it('should render filter button when tutorial filter feature toggle is activate', async function () {
    // given
    class FeatureTogglesStub extends Service {
      featureToggles = { isPixAppTutoFiltersEnabled: true };
    }
    this.owner.register('service:featureToggles', FeatureTogglesStub);

    // when
    const screen = await render(hbs`<Tutorials::Header />`);

    // then
    expect(screen.getByRole('button', { name: 'Filtrer' })).to.exist;
  });
});
