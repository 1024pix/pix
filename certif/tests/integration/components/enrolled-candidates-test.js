import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import config from 'pix-certif/config/environment';

module.only('Integration | Component | enrolled-candidates', function(hooks) {
  setupRenderingTest(hooks);

  const CERTIFICATION_CANDIDATES_TABLE = 'certification-candidates-table tbody';
  const CERTIFICATION_CANDIDATES_ACTION_DELETE = 'certification-candidates-actions';
  const DELETE_BUTTON_DOM = 'certification-candidates-actions__delete-button';
  const DELETE_BUTTON_DOM_DISABLED = `${DELETE_BUTTON_DOM}--disabled`;
  const ADD_BUTTON = 'certification-candidates-add-button__text';
  const EXTERNAL_ID_COLUMN_SELECTOR = 'panel-candidate__externalId__';
  const RESULT_RECIPIENT_EMAIL_COLUMN_SELECTOR = 'panel-candidate__result-recipient-email__';
  const ft = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

  hooks.before(() => {
    config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = true;
  });

  hooks.after(() => {
    config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = ft;
  });

  test('it display candidates with delete disabled button if linked', async function(assert) {
    const certificationCandidates = [
      _buildCertificationCandidate({ isLinked: false }),
      _buildCertificationCandidate({ isLinked: true }),
      _buildCertificationCandidate({ isLinked: false }),
    ];

    this.set('certificationCandidates', certificationCandidates);

    // Template block usage:
    await render(hbs`
      <EnrolledCandidates @sessionId="1" @certificationCandidates={{certificationCandidates}}>
      </EnrolledCandidates>
    `);

    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr`).isVisible({ count: 3 });
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).isVisible({ count: 3 });

    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr:nth-child(1) .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).hasClass(DELETE_BUTTON_DOM);
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr:nth-child(2) .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).hasClass(DELETE_BUTTON_DOM_DISABLED);
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr:nth-child(3) .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).hasClass(DELETE_BUTTON_DOM);
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
      this.set('isCertificationCenterSco', isSco);
      this.set('isCertifPrescriptionScoEnabled', toggle);

      // Template block usage:
      await render(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{certificationCandidates}}
        @isCertificationCenterSco={{isCertificationCenterSco}}
        @isCertifPrescriptionScoEnabled={{isCertifPrescriptionScoEnabled}}
      >
      </EnrolledCandidates>
    `);

      if (buttonVisible) {
        assert.dom(`.${ADD_BUTTON}`).isVisible();
      } else {
        assert.dom(`.${ADD_BUTTON}`).isNotVisible();
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
      this.set('isCertificationCenterSco', isSco);
      this.set('isCertifPrescriptionScoEnabled', toggle);

      // Template block usage:
      await render(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{certificationCandidates}}
        @isCertificationCenterSco={{isCertificationCenterSco}}
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
