import { render } from '@1024pix/ember-testing-library';
import CandidateEditionModal from 'pix-certif/components/sessions/session-details/enrolled-candidates/candidate-edition-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | Sessions | SessionDetails | EnrolledCandidates | candidate-edition-modal',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it shows form', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const candidate = store.createRecord('certification-candidate', {
        firstName: 'Jean',
        lastName: 'De la fontaine',
        accessibilityAdjustmentNeeded: false,
      });

      const closeModalStub = sinon.stub();
      const updateCandidateDataFromValueStub = sinon.stub();
      const updateCandidateStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CandidateEditionModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @candidate={{candidate}}
            @updateCandidateDataFromValue={{updateCandidateDataFromValueStub}}
            @updateCandidate={{updateCandidateStub}}
          />
        </template>,
      );

      // then
      const lastNameInput = screen.getByRole('textbox', { name: 'Nom de naissance' });
      const firstNameInput = screen.getByRole('textbox', { name: 'Prénom' });

      assert.dom(lastNameInput).hasValue('De la fontaine');
      assert.dom(lastNameInput).hasAttribute('disabled');
      assert.dom(firstNameInput).hasValue('Jean');
      assert.dom(firstNameInput).hasAttribute('disabled');
      assert
        .dom(
          screen.getByRole('checkbox', {
            name: "Le candidat a besoin d'un aménagement",
            description: "L'aménagement consiste à retirer les questions non accessibles",
            checked: false,
          }),
        )
        .exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
    });
  },
);
