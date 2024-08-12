import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::GenerateUsernameModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When all students are eligible for the generation', function () {
    test('render the content message and enable action button', async function (assert) {
      // given
      this.selectedStudents = [1, 2];
      this.affectedStudents = [1, 2];

      // when
      const screen = await render(
        hbs`
            <ScoOrganizationParticipant::GenerateUsernameModal
                    @showModal={{true}}
                    @totalSelectedStudents={{this.selectedStudents.length}}
                    @totalAffectedStudents={{this.affectedStudents.length}}
            />`,
      );

      // then
      const title = t('pages.sco-organization-participants.generate-username-modal.title', {
        htmlSafe: true,
      });
      const strippedTitle = title.__string.replace(/<\/?[^>]+(>|$)/g, '');

      assert.ok(
        screen.getByRole('heading', {
          name: strippedTitle,
        }),
      );
      assert.dom(screen.getByText('2 élèves')).exists();
      assert.dom(screen.getByText('2 identifiants')).exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: t('common.actions.confirm'),
          }),
        )
        .isNotDisabled();
    });
  });

  module('When no students are eligible for the generation', function () {
    test('render the content message and disable action button', async function (assert) {
      // given
      this.selectedStudents = [1, 2];
      this.affectedStudents = [];

      // when
      const screen = await render(
        hbs`
            <ScoOrganizationParticipant::GenerateUsernameModal
                    @showModal={{true}}
                    @totalSelectedStudents={{this.selectedStudents.length}}
                    @totalAffectedStudents={{this.affectedStudents.length}}
            />`,
      );

      // then
      const title = t('pages.sco-organization-participants.generate-username-modal.title', {
        htmlSafe: true,
      });
      const strippedTitle = title.__string.replace(/<\/?[^>]+(>|$)/g, '');

      assert.ok(
        screen.getByRole('heading', {
          name: strippedTitle,
        }),
      );
      assert.dom(screen.getByText('2 élèves')).exists();
      assert.dom(screen.getByText('aucun identifiant')).exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: t('common.actions.confirm'),
          }),
        )
        .isDisabled();
    });
  });
});
