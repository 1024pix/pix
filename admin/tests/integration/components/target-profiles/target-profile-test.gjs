import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import TargetProfile from 'pix-admin/components/target-profiles/target-profile';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfile', function (hooks) {
  setupIntlRenderingTest(hooks);

  const targetProfileSampleData = {
    areKnowledgeElementsResettable: false,
    category: 'PREDEFINED',
    createdAt: new Date('2024-03-01'),
    hasLinkedCampaign: false,
    hasLinkedAutonomousCourse: false,
    id: 666,
    isSimplifiedAccess: false,
    maxLevel: 7,
    name: 'Dummy target-profile',
    outdated: false,
    ownerOrganizationId: '100',
    tubesCount: 6,
  };

  module('target profile overview section', function () {
    module('basic informations', function () {
      test('it should display target profile basic informations', async function (assert) {
        //given
        const model = { ...targetProfileSampleData };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        // then
        assert.ok(_findByListItemText(screen, `ID : ${model.id}`));
        assert.ok(_findByListItemText(screen, `Organisation de référence : ${model.ownerOrganizationId}`));
        assert.ok(_findByListItemText(screen, 'Date de création : 01/03/2024'));
        assert.ok(_findByListItemText(screen, 'Obsolète : Non'));
        assert.ok(_findByListItemText(screen, 'Parcours Accès Simplifié : Non'));
        assert.ok(_findByListItemText(screen, `${t('pages.target-profiles.resettable-checkbox.label')} : Non`));
        assert.ok(_findByListItemText(screen, `${t('pages.target-profiles.tubes-count')} : ${model.tubesCount}`));
      });
    });

    module('when no campaign is linked', function () {
      test('it should display a no-link information', async function (assert) {
        // given
        const model = { ...targetProfileSampleData };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        // then
        assert.dom(_findByListItemText(screen, 'Est associé à une campagne : Oui')).doesNotExist();
        assert.dom(_findByListItemText(screen, 'Est associé à un parcours autonome : Oui')).doesNotExist();
        assert.dom(_findByListItemText(screen, 'Associé à une campagne ou un parcours autonome : Non')).exists();
      });
    });

    module('when a campaign is linked', function () {
      test('it should display a link information', async function (assert) {
        // given
        const model = { ...targetProfileSampleData, hasLinkedCampaign: true };

        // when
        const screen = await render(<template><TargetProfile @model={{model}} /></template>);

        // then
        assert.dom(_findByListItemText(screen, 'Est associé à une campagne : Oui')).exists();
        assert.dom(_findByListItemText(screen, 'Est associé à un parcours autonome : Oui')).doesNotExist();
        assert.dom(_findByListItemText(screen, 'Associé à une campagne ou un parcours autonome : Non')).doesNotExist();
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
        assert.dom(_findByListItemText(screen, 'Est associé à une campagne : Oui')).exists();
        assert.dom(_findByListItemText(screen, 'Est associé à un parcours autonome : Oui')).exists();
        assert.dom(_findByListItemText(screen, 'Associé à une campagne ou un parcours autonome : Non')).doesNotExist();
        assert.dom(_findByListItemText(screen, 'Parcours Accès Simplifié : Oui')).exists();
      });
    });
  });
});

function _findByListItemText(screen, text) {
  return (
    screen.getAllByRole('listitem').find((listitem) => {
      const cleanListItemText = listitem.textContent.replace(/(\r\n|\n|\r)/gm, '').trim();
      return cleanListItemText === text;
    }) || null
  );
}
