import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfiles::TargetProfile', function (hooks) {
  setupIntlRenderingTest(hooks);

  const targetProfileSampleData = {
    areKnowledgeElementsResettable: false,
    category: 'PREDEFINED',
    createdAt: new Date('2024-03-01'),
    hasLinkedCampaign: false,
    hasLinkedAutonomousCourse: false,
    id: 666,
    isPublic: false,
    isSimplifiedAccess: false,
    maxLevel: 7,
    name: 'Dummy target-profile',
    outdated: false,
    ownerOrganizationId: '100',
  };

  module('campaign / autonomous course link', function () {
    module('when no campaign is linked', function () {
      test('it should display a no-link information', async function (assert) {
        // given
        this.set('model', { ...targetProfileSampleData });

        // when
        const screen = await render(hbs`<TargetProfiles::TargetProfile @model={{this.model}} />`);

        // then
        assert.dom(_findByListItemText(screen, 'Est associé à une campagne : Oui')).doesNotExist();
        assert.dom(_findByListItemText(screen, 'Est associé à un parcours autonome : Oui')).doesNotExist();
        assert.dom(_findByListItemText(screen, 'Associé à une campagne ou un parcours autonome : Non')).exists();
      });
    });

    module('when a campaign is linked', function () {
      test('it should display a link information', async function (assert) {
        // given
        this.set('model', { ...targetProfileSampleData, hasLinkedCampaign: true });

        // when
        const screen = await render(hbs`<TargetProfiles::TargetProfile @model={{this.model}} />`);

        // then
        assert.dom(_findByListItemText(screen, 'Est associé à une campagne : Oui')).exists();
        assert.dom(_findByListItemText(screen, 'Est associé à un parcours autonome : Oui')).doesNotExist();
        assert.dom(_findByListItemText(screen, 'Associé à une campagne ou un parcours autonome : Non')).doesNotExist();
      });
    });

    module('when an autonomous course is linked', function () {
      test('it should display specific informations', async function (assert) {
        // given
        this.set('model', {
          ...targetProfileSampleData,
          hasLinkedCampaign: true,
          hasLinkedAutonomousCourse: true,
          isSimplifiedAccess: true,
        });

        // when
        const screen = await render(hbs`<TargetProfiles::TargetProfile @model={{this.model}} />`);

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
