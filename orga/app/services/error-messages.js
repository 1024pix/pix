import Service, { inject as service } from '@ember/service';

const CAMPAIGN_CREATION_ERRORS = {
  CAMPAIGN_NAME_IS_REQUIRED: 'api-errors-messages.campaign-creation.name-required',
  CAMPAIGN_PURPOSE_IS_REQUIRED: 'api-errors-messages.campaign-creation.purpose-required',
  TARGET_PROFILE_IS_REQUIRED: 'api-errors-messages.campaign-creation.target-profile-required',
  EXTERNAL_USER_ID_IS_REQUIRED: 'api-errors-messages.campaign-creation.external-user-id-required',
};

const CSV_IMPORT_ERRORS = {
  ENCODING_NOT_SUPPORTED: 'api-errors-messages.student-csv-import.encoding-not-supported',
  BAD_CSV_FORMAT: 'api-errors-messages.student-csv-import.bad-csv-format',
  HEADER_REQUIRED: 'api-errors-messages.student-csv-import.header-required',
  HEADER_UNKNOWN: 'api-errors-messages.student-csv-import.header-unknown',
  FIELD_MIN_LENGTH: 'api-errors-messages.student-csv-import.field-min-length',
  FIELD_MAX_LENGTH: 'api-errors-messages.student-csv-import.field-max-length',
  FIELD_LENGTH: 'api-errors-messages.student-csv-import.field-length',
  FIELD_DATE_FORMAT: 'api-errors-messages.student-csv-import.field-date-format',
  FIELD_EMAIL_FORMAT: 'api-errors-messages.student-csv-import.field-email-format',
  FIELD_REQUIRED: 'api-errors-messages.student-csv-import.field-required',
  FIELD_BAD_VALUES: 'api-errors-messages.student-csv-import.field-bad-values',
  INA_FORMAT: 'api-errors-messages.student-csv-import.ina-format',
  INA_UNIQUE: 'api-errors-messages.student-csv-import.ina-unique',
  INSEE_CODE_INVALID: 'api-errors-messages.student-csv-import.insee-code-invalid',
  STUDENT_NUMBER_UNIQUE: 'api-errors-messages.student-csv-import.student-number-unique',
  STUDENT_NUMBER_FORMAT: 'api-errors-messages.student-csv-import.student-number-format',
};

const ERROR_MESSAGES = {
  ...CAMPAIGN_CREATION_ERRORS,
  ...CSV_IMPORT_ERRORS,
};

export default class ErrorMessagesService extends Service {
  @service intl;

  _formatMeta(meta) {
    if (!meta) return;
    if (meta.valids) {
      meta.valids = meta.valids.join(this.intl.t('api-errors-messages.or-separator'));
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
