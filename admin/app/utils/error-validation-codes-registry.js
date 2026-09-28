export const errorValidationCodesRegistry = {
  /**
   * Returns translated message from error code. If no error code matches, returns input code.
   * @param {Services['intl']} intl
   * @param {string} validationCode
   *  @return {string}
   */
  getTranslatedMessageFromValidationCode: (intl, validationCode) => {
    switch (validationCode) {
      case 'FIELD_REQUIRED':
        return intl.t('common.validation-error-messages.FIELD_REQUIRED');

      case 'FIELD_NOT_A_NUMBER':
        return intl.t('common.validation-error-messages.FIELD_NOT_A_NUMBER');

      default:
        return validationCode;
    }
  },
};
