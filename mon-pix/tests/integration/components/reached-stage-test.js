import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | reached-stage', function() {
  setupIntlRenderingTest();

  beforeEach(function() {
    // given
    this.set('reachedStageStarCount', 3);
    this.set('percentage', 50);
    this.set('stageCount', 5);
  });

  it('should render the reached stage', async function() {
    // when
    await render(hbs`<ReachedStage @starCount={{this.reachedStageStarCount}} @percentage={{this.percentage}} @stageCount={{this.stageCount}} />`);

    // then
    expect(find('.reached-stage__stars')).to.exist;
    expect(find('.reached-stage__percentage-text').textContent.trim()).to.equal('50 % de réussite');
    _expectStars(this.reachedStageStarCount, this.stageCount);
  });

  describe('stars rendering', function() {
    [
      { starCount: 0, stageCount: 1 },
      { starCount: 5, stageCount: 5 },
      { starCount: 5, stageCount: 6 },
      { starCount: 2, stageCount: 10 },
      { starCount: 2, stageCount: 3 },
      { starCount: 4, stageCount: 5 },
    ].map(({ starCount, stageCount }) => {
      it(`displays ${starCount} plain stars out of ${stageCount} stars`, async function() {
        // given
        this.set('reachedStageStarCount', starCount);
        this.set('stageCount', stageCount);

        // when
        await render(hbs`<ReachedStage @starCount={{this.reachedStageStarCount}} @percentage={{this.percentage}} @stageCount={{this.stageCount}} />`);

        // then
        _expectStars(starCount, stageCount);
      });
    });
  });
});

function _expectStars(starCount, stageCount) {
  for (let index = 1 ; index <= starCount ; index ++) {
    expect(find(`#acquired-star-${index}`)).to.exist;
    expect(find(`#unacquired-star-${index}`)).to.not.exist;
  }
  for (let index = starCount + 1 ; index <= stageCount ; index ++) {
    expect(find(`#acquired-star-${index}`)).to.not.exist;
    expect(find(`#unacquired-star-${index}`)).to.exist;
  }
}
