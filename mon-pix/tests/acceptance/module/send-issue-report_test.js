import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { waitForDialog, waitForDialogClose } from '../../helpers/wait-for';

module('Acceptance | Module | Routes | sendIssueReport', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when a feedback is displayed in the passage', function () {
    test('user can send an issue report', async function (assert) {
      // given
      const comment = 'Mon super commentaire dans un test d‘acceptance';
      const qcu = {
        id: 'elementId-1',
        type: 'qcu',
        instruction: 'instruction',
        proposals: [
          { id: '1', content: 'I am the wrong answer!', feedback: { state: 'Faux' } },
          { id: '2', content: 'I am the right answer!', feedback: { state: "Bravo ! C'est la bonne réponse." } },
        ],
        solution: '2',
      };

      const section = server.create('section', {
        id: 'sectionId-1',
        grains: [
          {
            id: 'grainId',
            title: 'title',
            components: [
              {
                type: 'element',
                element: qcu,
              },
            ],
          },
        ],
      });

      server.create('module', {
        id: 'def0f7e1-8f4d-4352-a7b3-1cccff1038d6',
        shortId: '3r7cl7m3',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        sections: [section],
      });

      // when
      const screen = await visit('/modules/3r7cl7m3/bien-ecrire-son-adresse-mail/passage');
      await click(screen.getByLabelText('I am the right answer!'));
      await click(screen.getByRole('button', { name: 'Vérifier ma réponse' }));

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));

      // when
      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
      await waitForDialog();

      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Problème d’accessibilité' }));

      await fillIn(
        screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }),
        comment,
      );

      await click(screen.getByRole('button', { name: t('common.actions.send') }));
      const closeButtons = screen.getAllByRole('button', { name: t('common.actions.close') });
      await click(closeButtons[1]);
      await waitForDialogClose();

      // then
      assert.dom(screen.queryByRole('dialog')).doesNotExist();
    });
  });
});
