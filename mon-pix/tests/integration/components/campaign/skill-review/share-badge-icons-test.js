import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const possibleBadgesCombinations = [
  { id: 1, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: true },
  { id: 2, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: false },
  { id: 3, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: true },
  { id: 4, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: false },
  { id: 5, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: true },
  { id: 6, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: false },
  { id: 7, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: true },
  { id: 8, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: false },
  { id: 9, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: true },
  { id: 10, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: false },
  { id: 11, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: true },
  { id: 12, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: false },
  { id: 13, isAcquired: false, isCertifiable: false, isValid: true, isAlwaysVisible: true },
  { id: 14, isAcquired: false, isCertifiable: false, isValid: true, isAlwaysVisible: false },
  { id: 15, isAcquired: false, isCertifiable: false, isValid: false, isAlwaysVisible: true },
  { id: 16, isAcquired: false, isCertifiable: false, isValid: false, isAlwaysVisible: false },
];

module('Integration | Component | Campaign | Skill Review | share-badge-icons', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a list of competences and their scores', async function (assert) {
    // given
    const model = {
      campaignParticipationResult: EmberObject.create({ campaignParticipationBadges: possibleBadgesCombinations }),
    };

    this.set('model', model);

    // when
    const screen = await render(hbs`<Campaigns::Assessment::SkillReview::ShareBadgeIcons
  @badges={{this.model.campaignParticipationResult.campaignParticipationBadges}}
/>`);

    // then
    assert.strictEqual(screen.getAllByRole('listitem').length, 4);
  });

  test('it should not display the component', async function (assert) {
    // given
    const noAcquiredBadges = possibleBadgesCombinations.filter((badge) => !badge.isAcquired);

    const model = {
      campaignParticipationResult: EmberObject.create({ campaignParticipationBadges: noAcquiredBadges }),
    };

    this.set('model', model);

    // when
    const screen = await render(hbs`<Campaigns::Assessment::SkillReview::ShareBadgeIcons
  @badges={{this.model.campaignParticipationResult.campaignParticipationBadges}}
/>`);

    // then
    assert.strictEqual(screen.queryByRole('list'), null);
  });
});
