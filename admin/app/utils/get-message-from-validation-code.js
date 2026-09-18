export function getTranslatedMessageFromValidationCode(intl, validationCode) {
  switch (validationCode) {
    case 'FIELD_REQUIRED':
      return intl.t('common.validation-error-messages.FIELD_REQUIRED');

    case 'FIELD_NOT_A_NUMBER':
      return intl.t('common.validation-error-messages.FIELD_NOT_A_NUMBER');

    default:
      return intl.t('common.validation-error-messages.DEFAULT');
  }
}
