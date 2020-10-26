import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import config from 'pix-certif/config/environment';

module('Integration | Component | enrolled-candidates', function(hooks) {
  setupRenderingTest(hooks);

  const CERTIFICATION_CANDIDATES_TABLE_SELECTOR = 'certification-candidates-table tbody';
  const CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR = 'certification-candidates-actions';
  const DELETE_BUTTON_SELECTOR = 'certification-candidates-actions__delete-button';
  const DELETE_BUTTON_DISABLED_SELECTOR = `${DELETE_BUTTON_SELECTOR}--disabled`;
  const ADD_BUTTON_SELECTOR = 'certification-candidates-add-button__text';
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

  const ft = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

  hooks.before(() => {
    config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = true;
  });

  hooks.after(() => {
    config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = ft;
  });

  test('it display candidates information', async function(assert) {

    const candidate = _buildCertificationCandidate({
      externalId: 'externalId',
      birthdate: new Date('1980-07-01'),
      isLinked: false,
      extraTimePercentage: 0.1,
    });
    const certificationCandidates = [candidate];

    this.set('certificationCandidates', certificationCandidates);

    await render(hbs`
      <EnrolledCandidates @sessionId="1" @certificationCandidates={{certificationCandidates}}>
      </EnrolledCandidates>
    `);

    assert.dom(`[data-test-id=${EXTERNAL_ID_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.externalId);
    assert.dom(`[data-test-id=${BIRTHDATE_COLUMN_SELECTOR}${candidate.id}]`).hasText('01/07/1980');
    assert.dom(`[data-test-id=${LAST_NAME_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.lastName);
    assert.dom(`[data-test-id=${FIRST_NAME_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.firstName);
    assert.dom(`[data-test-id=${BIRTH_CITY_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.birthCity);
    assert.dom(`[data-test-id=${BIRTH_PROVINCE_CODE_COLUMN_SELECTOR}${candidate.id}]`).hasText(candidate.birthProvinceCode);
    assert.dom(`[data-test-id=${BIRTH_COUNTRY_SELECTOR}${candidate.id}]`).hasText(candidate.birthCountry);
    assert.dom(`[data-test-id=${EMAIL_SELECTOR}${candidate.id}]`).hasText(candidate.email);
    assert.dom(`[data-test-id=${EXTRA_TIME_SELECTOR}${candidate.id}]`).hasText('10 %');
  });

  test('it display candidates with delete disabled button if linked', async function(assert) {
    const certificationCandidates = [
      _buildCertificationCandidate({ isLinked: false }),
      _buildCertificationCandidate({ isLinked: true }),
      _buildCertificationCandidate({ isLinked: false }),
    ];

    this.set('certificationCandidates', certificationCandidates);
    this.set('isUserFromSco', true);

    await render(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{this.certificationCandidates}}
        @isUserFromSco={{this.isUserFromSco}}>
      </EnrolledCandidates>
    `);

    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr`).isVisible({ count: 3 });
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`).isVisible({ count: 3 });

    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr:nth-child(1) .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`).hasClass(DELETE_BUTTON_SELECTOR);
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr:nth-child(2) .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`).hasClass(DELETE_BUTTON_DISABLED_SELECTOR);
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE_SELECTOR} tr:nth-child(3) .${CERTIFICATION_CANDIDATES_ACTION_DELETE_SELECTOR} button`).hasClass(DELETE_BUTTON_SELECTOR);
  });

  [
    { isSco: true, toggle: true, buttonVisible: false },
    { isSco: true, toggle: false, buttonVisible: true },
    { isSco: false, toggle: false, buttonVisible: true },
    { isSco: false, toggle: true, buttonVisible: true },
  ].forEach(({ isSco, toggle, buttonVisible }) =>
    test(`it does ${buttonVisible ? '' : 'not '}display candidates add button if user ${isSco ? '' : 'not '}sco and if feature toggle is ${toggle}`, async function(assert) {
      const certificationCandidates = [];

      this.set('certificationCandidates', certificationCandidates);
      this.set('isUserFromSco', isSco);
      this.set('isCertifPrescriptionScoEnabled', toggle);

      // Template block usage:
      await render(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{this.certificationCandidates}}
        @isUserFromSco={{this.isUserFromSco}}
        @isCertifPrescriptionScoEnabled={{this.isCertifPrescriptionScoEnabled}}
      >
      </EnrolledCandidates>
    `);

      if (buttonVisible) {
        assert.dom(`.${ADD_BUTTON_SELECTOR}`).isVisible();
      } else {
        assert.dom(`.${ADD_BUTTON_SELECTOR}`).isNotVisible();
      }
    }),
  );

  [
    { isSco: true, toggle: true, shouldColumnsBeEmpty: true },
    { isSco: true, toggle: false, shouldColumnsBeEmpty: false },
    { isSco: false, toggle: false, shouldColumnsBeEmpty: false },
    { isSco: false, toggle: true, shouldColumnsBeEmpty: false },
  ].forEach(({ isSco, toggle, shouldColumnsBeEmpty }) =>
    test(`it ${shouldColumnsBeEmpty ? 'does not' : 'does'} fill externalId and email columnss if user ${isSco ? 'is' : 'is not'} sco and if feature toggle is ${toggle}`, async function(assert) {
      const candidate = _buildCertificationCandidate({});
      const certificationCandidates = [
        _buildCertificationCandidate({}),
      ];

      this.set('certificationCandidates', certificationCandidates);
      this.set('isUserFromSco', isSco);
      this.set('isCertifPrescriptionScoEnabled', toggle);

      await render(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{certificationCandidates}}
        @isUserFromSco={{isUserFromSco}}
        @isCertifPrescriptionScoEnabled={{isCertifPrescriptionScoEnabled}}
      >
      </EnrolledCandidates>
    `);

      if (shouldColumnsBeEmpty) {
        assert.dom(`[data-test-id=${EXTERNAL_ID_COLUMN_SELECTOR}${candidate.id}]`).doesNotExist();
        assert.dom(`[data-test-id=${RESULT_RECIPIENT_EMAIL_COLUMN_SELECTOR}${candidate.id}]`).doesNotExist();
      } else {
        assert.dom(`[data-test-id=${EXTERNAL_ID_COLUMN_SELECTOR}${candidate.id}]`).exists();
        assert.dom(`[data-test-id=${RESULT_RECIPIENT_EMAIL_COLUMN_SELECTOR}${candidate.id}]`).exists();
      }
    }),
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
  };
}
