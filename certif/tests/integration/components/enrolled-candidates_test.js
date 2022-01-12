import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | enrolled-candidates', function (hooks) {
  setupRenderingTest(hooks);

  const CERTIFICATION_CANDIDATES_TABLE_SELECTOR = 'certification-candidates-table tbody';
  const CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR = 'certification-candidates-actions__delete';
  const DELETE_BUTTON_SELECTOR = 'certification-candidates-actions__delete-button';
  const DELETE_BUTTON_DISABLED_SELECTOR = `${DELETE_BUTTON_SELECTOR}--disabled`;
  const ADD_SINGLE_CANDIDATE_BUTTON_SELECTOR = 'certification-candidates-add-button__text';
  const ADD_MULTIPLE_CANDIDATE_BUTTON_SELECTOR = 'enrolled-candidate__add-students';
  const EXTERNAL_ID_COLUMN_SELECTOR = 'panel-candidate__externalId__';
  const RESULT_RECIPIENT_EMAIL_COLUMN_SELECTOR = 'panel-candidate__result-recipient-email__';
  const BIRTHDATE_COLUMN_SELECTOR = 'panel-candidate__birthdate__';
  const LAST_NAME_COLUMN_SELECTOR = 'panel-candidate__lastName__';
  const FIRST_NAME_COLUMN_SELECTOR = 'panel-candidate__firstName__';
  const BIRTH_CITY_COLUMN_SELECTOR = 'panel-candidate__birthCity__';
  const BIRTH_PROVINCE_CODE_COLUMN_SELECTOR = 'panel-candidate__birthProvinceCode__';
  const BIRTH_COUNTRY_SELECTOR = 'panel-candidate__birthCountry__';
  const EMAIL_SELECTOR = 'panel-candidate__email__';
  const EXTRA_TIME_SELECTOR = 'panel-candidate__extraTimePercentage__';
  const COMPLEMENTARY_CERTIFICATIONS_SELECTOR = 'panel-candidate__complementaryCertifications__';

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('when feature toggle FT_IS_COMPLEMENTARY_CERTIFICATION_SUBSCRIPTION_ENABLED is enabled', () => {
    test('it displays candidate information', async function (assert) {
      // given
      this.set('displayComplementaryCertification', true);
      const candidate = _buildCertificationCandidate({
        birthdate: new Date('2019-04-28'),
      });

      const certificationCandidate = store.createRecord('certification-candidate', candidate);

      const certificationCandidates = [certificationCandidate];

      this.set('certificationCandidates', certificationCandidates);

      // when
      await render(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{certificationCandidates}}
          @displayComplementaryCertification={{displayComplementaryCertification}}
          >
        </EnrolledCandidates>
      `);

      // then
      assert.dom(`[data-test-id=${EXTERNAL_ID_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.externalId);
      assert.dom(`[data-test-id=${BIRTHDATE_COLUMN_SELECTOR}${candidate.id}]`).hasText('28/04/2019');
      assert.dom(`[data-test-id=${LAST_NAME_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.lastName);
      assert.dom(`[data-test-id=${FIRST_NAME_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.firstName);
      assert
        .dom(`[data-test-id=${RESULT_RECIPIENT_EMAIL_COLUMN_SELECTOR}${candidate.id}]`)
        .hasText(candidate.resultRecipientEmail);
      assert.dom(`[data-test-id=${EXTRA_TIME_SELECTOR}${candidate.id}]`).hasText('3000 %');
      assert
        .dom(`[data-test-id=${COMPLEMENTARY_CERTIFICATIONS_SELECTOR}${candidate.id}]`)
        .hasText('Pix+Edu, Pix+Droit');
      assert.dom(`[data-test-id=${BIRTH_CITY_COLUMN_SELECTOR}${candidate.id}]`).doesNotExist();
      assert.dom(`[data-test-id=${BIRTH_PROVINCE_CODE_COLUMN_SELECTOR}${candidate.id}]`).doesNotExist();
      assert.dom(`[data-test-id=${BIRTH_COUNTRY_SELECTOR}${candidate.id}]`).doesNotExist();
      assert.dom(`[data-test-id=${EMAIL_SELECTOR}${candidate.id}]`).doesNotExist();
    });
    test('it displays a dash where there is no certification', async function (assert) {
      // given
      this.set('displayComplementaryCertification', true);
      const candidate = _buildCertificationCandidate({
        complementaryCertifications: null,
      });

      const certificationCandidate = store.createRecord('certification-candidate', candidate);

      const certificationCandidates = [certificationCandidate];

      this.set('certificationCandidates', certificationCandidates);

      // when
      await render(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{certificationCandidates}}
          @displayComplementaryCertification={{displayComplementaryCertification}}
          >
        </EnrolledCandidates>
      `);

      // then
      assert.dom(`[data-test-id=${COMPLEMENTARY_CERTIFICATIONS_SELECTOR}${candidate.id}]`).hasText('-');
    });
  });

  module('when feature toggle FT_IS_COMPLEMENTARY_CERTIFICATION_SUBSCRIPTION_ENABLED is disabled', () => {
    test('it display candidate information without complementary certification', async function (assert) {
      // given
      this.set('displayComplementaryCertification', false);

      const candidate = _buildCertificationCandidate({
        birthdate: new Date('2019-04-28'),
      });

      const certificationCandidate = store.createRecord('certification-candidate', candidate);

      const certificationCandidates = [certificationCandidate];

      this.set('certificationCandidates', certificationCandidates);

      // when
      await render(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{certificationCandidates}}
          @displayComplementaryCertification={{displayComplementaryCertification}}
          >
        </EnrolledCandidates>
      `);

      // then
      assert.notContains('Certifications complémentaires');
      assert.dom(`[data-test-id=${COMPLEMENTARY_CERTIFICATIONS_SELECTOR}${candidate.id}]`).doesNotExist();
    });
  });

  test('it should display details button', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({});
    const certificationCandidates = [candidate];

    this.set('certificationCandidates', certificationCandidates);

    // when
    await render(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{certificationCandidates}}
        >
        </EnrolledCandidates>
      `);

    // then
    assert.dom(`[aria-label="Voir le détail du candidat ${candidate.firstName} ${candidate.lastName}"]`).isVisible();
  });

  test('it display candidates with delete disabled button if linked', async function (assert) {
    // given
    const certificationCandidates = [
      _buildCertificationCandidate({ isLinked: false }),
      _buildCertificationCandidate({ isLinked: true }),
      _buildCertificationCandidate({ isLinked: false }),
    ];

    this.set('certificationCandidates', certificationCandidates);

    // when
    await render(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{this.certificationCandidates}}>
      </EnrolledCandidates>
    `);

    // then
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr`).isVisible({ count: 3 });
    assert
      .dom(`.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`)
      .isVisible({ count: 3 });

    assert
      .dom(
        `.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr:nth-child(1) .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`
      )
      .hasClass(DELETE_BUTTON_SELECTOR);
    assert
      .dom(
        `.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr:nth-child(2) .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`
      )
      .hasClass(DELETE_BUTTON_DISABLED_SELECTOR);
    assert
      .dom(
        `.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr:nth-child(3) .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`
      )
      .hasClass(DELETE_BUTTON_SELECTOR);
  });

  module('add student(s) button', () => {
    [
      {
        shouldDisplayPrescriptionScoStudentRegistrationFeature: true,
        multipleButtonVisible: true,
        it: 'it does display button to add multiple candidates if prescription sco feature is allowed',
      },
      {
        shouldDisplayPrescriptionScoStudentRegistrationFeature: false,
        multipleButtonVisible: false,
        it: 'it does not display button to add multiple candidates if prescription sco feature is not allowed',
      },
    ].forEach(({ shouldDisplayPrescriptionScoStudentRegistrationFeature, multipleButtonVisible, it }) =>
      test(it, async function (assert) {
        // given
        const certificationCandidates = [];

        this.set('certificationCandidates', certificationCandidates);
        this.set(
          'shouldDisplayPrescriptionScoStudentRegistrationFeature',
          shouldDisplayPrescriptionScoStudentRegistrationFeature
        );

        // when
        await render(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{this.certificationCandidates}}
          @shouldDisplayPrescriptionScoStudentRegistrationFeature={{this.shouldDisplayPrescriptionScoStudentRegistrationFeature}}
        >
        </EnrolledCandidates>
        `);

        // then
        if (multipleButtonVisible) {
          assert.dom(`.${ADD_MULTIPLE_CANDIDATE_BUTTON_SELECTOR}`).isVisible();
          assert.dom(`.${ADD_SINGLE_CANDIDATE_BUTTON_SELECTOR}`).isNotVisible();
        } else {
          assert.dom(`.${ADD_MULTIPLE_CANDIDATE_BUTTON_SELECTOR}`).isNotVisible();
          assert.dom(`.${ADD_SINGLE_CANDIDATE_BUTTON_SELECTOR}`).isVisible();
        }
      })
    );
  });

  [
    {
      shouldDisplayPrescriptionScoStudentRegistrationFeature: true,
      shouldColumnsBeEmpty: true,
      it: 'it hides externalId and email columns if prescription sco feature allowed',
    },
    {
      shouldDisplayPrescriptionScoStudentRegistrationFeature: false,
      shouldColumnsBeEmpty: false,
      it: 'it shows externalId and email columns if prescription sco feature not allowed',
    },
  ].forEach(({ shouldDisplayPrescriptionScoStudentRegistrationFeature, shouldColumnsBeEmpty, it }) =>
    test(it, async function (assert) {
      // given
      const candidate = _buildCertificationCandidate({});
      const certificationCandidates = [_buildCertificationCandidate({})];

      this.set('certificationCandidates', certificationCandidates);
      this.set(
        'shouldDisplayPrescriptionScoStudentRegistrationFeature',
        shouldDisplayPrescriptionScoStudentRegistrationFeature
      );

      // when
      await render(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{certificationCandidates}}
        @shouldDisplayPrescriptionScoStudentRegistrationFeature={{this.shouldDisplayPrescriptionScoStudentRegistrationFeature}}
      >
      </EnrolledCandidates>
    `);

      // then
      if (shouldColumnsBeEmpty) {
        assert.dom(`[data-test-id=${EXTERNAL_ID_COLUMN_SELECTOR}${candidate.id}]`).doesNotExist();
        assert.dom(`[data-test-id=${RESULT_RECIPIENT_EMAIL_COLUMN_SELECTOR}${candidate.id}]`).doesNotExist();
      } else {
        assert.dom(`[data-test-id=${EXTERNAL_ID_COLUMN_SELECTOR}${candidate.id}]`).exists();
        assert.dom(`[data-test-id=${RESULT_RECIPIENT_EMAIL_COLUMN_SELECTOR}${candidate.id}]`).exists();
      }
    })
  );
});

function _buildCertificationCandidate({
  id = 12345,
  firstName = 'Bob',
  lastName = 'Leponge',
  birthdate = new Date(),
  birthCity = 'Marseille',
  birthProvinceCode = '',
  birthCountry = '',
  email = 'bob.leponge@la.mer',
  resultRecipientEmail = 'recipient@college.fr',
  externalId = 'an external id',
  extraTimePercentage = 30,
  isLinked = false,
  complementaryCertifications = [
    {
      id: 1,
      name: 'Pix+Edu',
    },
    {
      id: 2,
      name: 'Pix+Droit',
    },
  ],
}) {
  return {
    id,
    firstName,
    lastName,
    birthdate,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    externalId,
    extraTimePercentage,
    isLinked,
    complementaryCertifications,
  };
}
