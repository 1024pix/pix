import { render } from '@1024pix/ember-testing-library';
import CertificationVersionEditForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-edit-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | certification-frameworks/certification-framework/versions/certification-version-edit-form',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it should display input with pre-completed input if value exist', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const draftVersion = store.createRecord('certification-version', {
        id: 456,
        startDate: new Date('2023-10-10'),
        assessmentDuration: 95,
        minimumAnswersRequiredForValidation: 20,
        maximumAssessmentLength: 32,
        challengesBetweenSameCompetence: 4,
        defaultProbabilityToPickChallenge: 0.6,
        variationPercent: 25.5,
        defaultCandidateCapacity: -2,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
        status: 'draft',
        scope: 'DROIT',
      });

      // when
      const screen = await render(<template><CertificationVersionEditForm @draftVersion={{draftVersion}} /></template>);

      // then
      assert
        .dom(
          screen.getByLabelText(
            t('components.certification-frameworks.certification-framework.versions.edit.start-date-label'),
            {
              exact: false,
            },
          ),
        )
        .hasValue('2023-10-10');
      assert
        .dom(
          screen.getByLabelText(
            t('components.certification-frameworks.certification-framework.versions.edit.assessment-duration-label'),
            { exact: false },
          ),
        )
        .hasValue('01:35');
      assert
        .dom(
          screen.getByLabelText(
            t(
              'components.certification-frameworks.certification-framework.versions.edit.default-probability-to-pick-challenge-label',
            ),
            { exact: false },
          ),
        )
        .hasValue('0.6');
      assert
        .dom(
          screen.getByLabelText(
            t('components.certification-frameworks.certification-framework.versions.edit.variation-percent-label'),
            { exact: false },
          ),
        )
        .hasValue('25.5');
      assert
        .dom(
          screen.getByLabelText(
            t(
              'components.certification-frameworks.certification-framework.versions.edit.default-candidate-capacity-label',
            ),
            { exact: false },
          ),
        )
        .hasValue('-2');
      assert
        .dom(
          screen.getByLabelText(
            t(
              'components.certification-frameworks.certification-framework.versions.edit.maximum-assessment-length-label',
            ),
            { exact: false },
          ),
        )
        .hasValue('32');
      assert
        .dom(
          screen.getByLabelText(
            t(
              'components.certification-frameworks.certification-framework.versions.edit.minimum-answers-required-for-validation-label',
            ),
            { exact: false },
          ),
        )
        .hasValue('20');
      assert
        .dom(
          screen.getByLabelText(
            t(
              'components.certification-frameworks.certification-framework.versions.edit.challenges-between-same-competence-label',
            ),
            { exact: false },
          ),
        )
        .hasValue('4');
      assert
        .dom(
          screen.getByRole('checkbox', {
            name: t(
              'components.certification-frameworks.certification-framework.versions.edit.limit-to-one-question-per-tube-label',
            ),
          }),
        )
        .isChecked();
      assert
        .dom(
          screen.getByRole('checkbox', {
            name: t(
              'components.certification-frameworks.certification-framework.versions.edit.enable-passage-by-all-competences-label',
            ),
          }),
        )
        .isChecked();
    });

    test('it should inform user when empty input is required', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const draftVersion = store.createRecord('certification-version', {
        id: 456,
        startDate: null,
        assessmentDuration: 95,
        minimumAnswersRequiredForValidation: 20,
        maximumAssessmentLength: 32,
        challengesBetweenSameCompetence: 4,
        defaultProbabilityToPickChallenge: 0.6,
        variationPercent: 25.5,
        defaultCandidateCapacity: -2,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
        status: 'draft',
        scope: 'DROIT',
      });

      const screen = await render(<template><CertificationVersionEditForm @draftVersion={{draftVersion}} /></template>);

      // then
      assert
        .dom(
          screen.getByText(
            t('components.certification-frameworks.certification-framework.versions.edit.validation-message-error'),
          ),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: t('components.certification-frameworks.certification-framework.versions.edit.submit-button'),
          }),
        )
        .hasAttribute('aria-disabled');
    });

    module('when there is no activeVersion', function () {
      test('it should hide subLabel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: 456,
          status: 'draft',
          scope: 'DROIT',
        });

        // when
        const screen = await render(
          <template><CertificationVersionEditForm @draftVersion={{draftVersion}} /></template>,
        );

        // then
        assert
          .dom(
            screen.queryByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', { value: '' }),
              { exact: false },
            ),
          )
          .doesNotExist();
      });
    });

    module('when there is an activeVersion', function () {
      test('it should display subLabel for all input ', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const activeVersion = store.createRecord('certification-version', {
          id: 123,
          startDate: new Date('2026-01-01'),
          expirationDate: null,
          assessmentDuration: 123,
          minimumAnswersRequiredForValidation: 30,
          maximumAssessmentLength: 45,
          challengesBetweenSameCompetence: 6,
          defaultProbabilityToPickChallenge: 0.54,
          variationPercent: 0,
          defaultCandidateCapacity: -3,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          status: 'active',
          scope: 'DROIT',
        });

        const draftVersion = store.createRecord('certification-version', {
          id: 124,
          status: 'draft',
          scope: 'DROIT',
        });

        // when
        const screen = await render(
          <template>
            <CertificationVersionEditForm @activeVersion={{activeVersion}} @draftVersion={{draftVersion}} />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', {
                value: '2026-01-01',
              }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', {
                value: '02:03',
              }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', { value: 0.54 }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', { value: 0 }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', { value: -3 }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', { value: 45 }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', { value: 30 }),
            ),
          )
          .exists();
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.edit.sublabel', { value: 6 }),
            ),
          )
          .exists();
      });

      test('it should display the active version value for checkboxes', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const activeVersion = store.createRecord('certification-version', {
          id: 123,
          status: 'active',
          scope: 'DROIT',
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: false,
        });

        const draftVersion = store.createRecord('certification-version', {
          id: 124,
          status: 'draft',
          scope: 'DROIT',
        });

        // when
        const screen = await render(
          <template>
            <CertificationVersionEditForm @activeVersion={{activeVersion}} @draftVersion={{draftVersion}} />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByRole('checkbox', {
              name: new RegExp(
                `${t('components.certification-frameworks.certification-framework.versions.edit.limit-to-one-question-per-tube-label')}.*✅ ${t('common.words.yes')}`,
              ),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('checkbox', {
              name: new RegExp(
                `${t('components.certification-frameworks.certification-framework.versions.edit.enable-passage-by-all-competences-label')}.*⬜ ${t('common.words.no')}`,
              ),
            }),
          )
          .exists();
      });
    });
  },
);
