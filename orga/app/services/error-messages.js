import Service, { inject as service } from '@ember/service';

const CAMPAIGN_CREATION_ERRORS = {
  CAMPAIGN_NAME_IS_REQUIRED: 'api-error-messages.campaign-creation.name-required',
  CAMPAIGN_PURPOSE_IS_REQUIRED: 'api-error-messages.campaign-creation.purpose-required',
  TARGET_PROFILE_IS_REQUIRED: 'api-error-messages.campaign-creation.target-profile-required',
  EXTERNAL_USER_ID_IS_REQUIRED: 'api-error-messages.campaign-creation.external-user-id-required',
  OWNER_NOT_IN_ORGANIZATION: 'api-error-messages.campaign-creation.owner_not_in_organization',
  CAMPAIGN_TITLE_IS_TOO_LONG: 'api-error-messages.campaign-creation.title_too_long',
  CUSTOM_LANDING_PAGE_TEXT_IS_TOO_LONG: 'api-error-messages.campaign-creation.custom-landing-page-text_too_long',
};

const CSV_IMPORT_ERRORS = {
  ENCODING_NOT_SUPPORTED: 'api-error-messages.student-csv-import.encoding-not-supported',
  BAD_CSV_FORMAT: 'api-error-messages.student-csv-import.bad-csv-format',
  HEADER_REQUIRED: 'api-error-messages.student-csv-import.header-required',
  HEADER_UNKNOWN: 'api-error-messages.student-csv-import.header-unknown',
  FIELD_MIN_LENGTH: 'api-error-messages.student-csv-import.field-min-length',
  FIELD_MAX_LENGTH: 'api-error-messages.student-csv-import.field-max-length',
  FIELD_LENGTH: 'api-error-messages.student-csv-import.field-length',
  FIELD_DATE_FORMAT: 'api-error-messages.student-csv-import.field-date-format',
  FIELD_EMAIL_FORMAT: 'api-error-messages.student-csv-import.field-email-format',
  FIELD_REQUIRED: 'api-error-messages.student-csv-import.field-required',
  FIELD_BAD_VALUES: 'api-error-messages.student-csv-import.field-bad-values',
  IDENTIFIER_UNIQUE: 'api-error-messages.student-csv-import.identifier-unique',
  INSEE_CODE_INVALID: 'api-error-messages.student-csv-import.insee-code-invalid',
  PAYLOAD_TOO_LARGE: 'api-error-messages.student-csv-import.payload-too-large',
  STUDENT_NUMBER_UNIQUE: 'api-error-messages.student-csv-import.student-number-unique',
  STUDENT_NUMBER_FORMAT: 'api-error-messages.student-csv-import.student-number-format',
};

const XML_IMPORT_ERRORS = {
  EMPTY: 'api-error-messages.student-xml-import.empty',
  ENCODING_NOT_SUPPORTED: 'api-error-messages.student-xml-import.encoding-not-supported',
  INE_REQUIRED: 'api-error-messages.student-xml-import.ine-required',
  INE_UNIQUE: 'api-error-messages.student-xml-import.ine-unique',
  INVALID_FILE: 'api-error-messages.student-xml-import.invalid-file',
  INVALID_FILE_EXTENSION: 'api-error-messages.student-xml-import.invalid-file-extension',
  PAYLOAD_TOO_LARGE: 'api-error-messages.student-xml-import.payload-too-large',
  UAI_MISMATCHED: 'api-error-messages.student-xml-import.uai-mismatched',
  SEX_CODE_REQUIRED: 'api-errors-messages.student-xml-import.sex-code-required',
};

const ERROR_MESSAGES = {
  ...CAMPAIGN_CREATION_ERRORS,
  ...CSV_IMPORT_ERRORS,
  ...XML_IMPORT_ERRORS,
};

export default class ErrorMessagesService extends Service {
  @service intl;

  _formatMeta(meta) {
    if (!meta) return;
    if (meta.valids) {
      meta.valids = meta.valids.join(this.intl.t('api-error-messages.or-separator'));
    }
    return meta;
  }

  getErrorMessage(code, meta) {
    if (!code) return;
    const i18nKey = ERROR_MESSAGES[code];
    if (!i18nKey) return;
    return this.intl.t(i18nKey, this._formatMeta(meta));
  }
}
