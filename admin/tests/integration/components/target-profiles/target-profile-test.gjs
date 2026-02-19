import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import TargetProfile from 'pix-admin/components/target-profiles/target-profile';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfile', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const serviceRouter = this.owner.lookup('service:router');
    sinon.stub(serviceRouter, 'currentRouteName').value('authenticated.target-profiles.target-profile');
    sinon.stub(serviceRouter, 'currentRoute').value({ localName: 'targetProfile' });
  });

  const targetProfileSampleData = {
    internalName: 'Profil cible',
    areKnowledgeElementsResettable: false,
    category: 'PREDEFINED',
    createdAt: new Date('2024-03-01'),
    hasLinkedCampaign: false,
    hasLinkedAutonomousCourse: false,
    id: 666,
    isSimplifiedAccess: false,
    estimatedTime: 1800,
    maxLevel: 7,
    name: 'Dummy target-profile',
    outdated: false,
    ownerOrganizationId: '100',
    tubesCount: 6,
  };

  module('target profile overview section', function () {
    module('basic informations', function () {
      test('it should display target profile basic information', async function (assert) {
        //given
        const model = { ...targetProfileSampleData };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        // then
        const termsList = screen.getAllByRole('term');
        const definitionsList = screen.getAllByRole('definition');

        assert.strictEqual(termsList[0].textContent, t('pages.target-profiles.label.id'));
        assert.strictEqual(definitionsList[0].textContent.trim(), '666');

        assert.strictEqual(termsList[3].textContent, t('pages.target-profiles.label.estimated-time'));

        assert.strictEqual(termsList[4].textContent, t('pages.target-profiles.label.created-at'));
        assert.strictEqual(definitionsList[4].textContent.trim(), '01/03/2024');

        assert.strictEqual(termsList[5].textContent, t('pages.target-profiles.label.outdated'));
        assert.strictEqual(definitionsList[5].textContent.trim(), t('common.words.no'));

        assert.strictEqual(termsList[6].textContent, t('pages.target-profiles.label.simplified-access'));
        assert.strictEqual(definitionsList[6].textContent.trim(), t('common.words.no'));

        assert.strictEqual(termsList[8].textContent, t('pages.target-profiles.resettable-checkbox.label'));
        assert.strictEqual(definitionsList[8].textContent.trim(), t('common.words.no'));

        assert.strictEqual(termsList[9].textContent, t('pages.target-profiles.tubes-count'));
        assert.strictEqual(definitionsList[9].textContent.trim(), `${model.tubesCount}`);
      });

      test('it should display link to a metabase dashboard', async function (assert) {
        //given
        const model = { ...targetProfileSampleData };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        //then
        const buttonLink = screen.getByRole('link', { name: 'Tableau de bord' });
        assert.ok(buttonLink);
        assert.strictEqual(buttonLink.getAttribute('href'), `${ENV.APP.TARGET_PROFILE_DASHBOARD_URL}?id=${model.id}`);
      });
    });

    module('when no campaign is linked', function () {
      test('it should display a no-link information', async function (assert) {
        // given
        const model = { ...targetProfileSampleData };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        // then
        assert.dom(screen.queryByText(t('pages.target-profiles.label.link-campaign'))).doesNotExist();
        assert.dom(screen.queryByText(t('pages.target-profiles.label.link-autonomous-course'))).doesNotExist();
        assert.strictEqual(
          screen.getAllByRole('term')[7].textContent,
          t('pages.target-profiles.label.link-autonomous-course-or-campaign'),
        );
        assert.strictEqual(screen.getAllByRole('definition')[7].textContent.trim(), t('common.words.no'));
      });
    });

    module('when a campaign is linked', function () {
      test('it should display a link information', async function (assert) {
        // given
        const model = { ...targetProfileSampleData, hasLinkedCampaign: true };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        // then
        assert.strictEqual(screen.getAllByRole('term')[7].textContent, t('pages.target-profiles.label.link-campaign'));
        assert.strictEqual(screen.getAllByRole('definition')[7].textContent.trim(), t('common.words.yes'));

        assert.dom(screen.queryByText(t('pages.target-profiles.label.link-autonomous-course'))).doesNotExist();
        assert
          .dom(screen.queryByText(t('pages.target-profiles.label.link-autonomous-course-or-campaign')))
          .doesNotExist();
      });
    });

    module('when an autonomous course is linked', function () {
      test('it should display specific information', async function (assert) {
        // given
        const model = {
          ...targetProfileSampleData,
          hasLinkedCampaign: true,
          hasLinkedAutonomousCourse: true,
          isSimplifiedAccess: true,
        };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        // then
        const termsList = screen.getAllByRole('term');
        const definitionsList = screen.getAllByRole('definition');

        assert.strictEqual(termsList[6].textContent, t('pages.target-profiles.label.simplified-access'));
        assert.strictEqual(definitionsList[6].textContent.trim(), t('common.words.yes'));

        assert.strictEqual(termsList[7].textContent, t('pages.target-profiles.label.link-campaign'));
        assert.strictEqual(definitionsList[7].textContent.trim(), t('common.words.yes'));

        assert.strictEqual(termsList[8].textContent, t('pages.target-profiles.label.link-autonomous-course'));
        assert.strictEqual(definitionsList[8].textContent.trim(), t('common.words.yes'));

        assert
          .dom(screen.queryByText(t('pages.target-profiles.label.link-autonomous-course-or-campaign')))
          .doesNotExist();
      });
    });
  });
});
