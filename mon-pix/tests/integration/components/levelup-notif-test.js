import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | levelup-notif', function() {
  setupIntlRenderingTest();

  it('renders', async function() {
    //when
    await render(hbs`<LevelupNotif />`);
    //then
    expect(find('.levelup__competence')).to.exist;
  });

  it('displays the new reached level and associated competence name', async function() {
    // given
    this.set('newLevel', 2);
    this.set('model', {
      title: 'Mener une recherche et une veille d\'information',
    });
    // when
    await render(hbs`<LevelupNotif @level={{this.newLevel}} @competenceName={{model.title}}/>`);
    // then
    expect(find('.levelup-competence__level').innerHTML).to.equal(this.intl.t('pages.levelup-notif.obtained-level', { level: this.newLevel }));
    expect(find('.levelup-competence__name').innerHTML).to.equal('Mener une recherche et une veille d\'information');
  });
});

