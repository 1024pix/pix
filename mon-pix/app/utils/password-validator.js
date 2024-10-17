export const PASSWORD_RULES = [
  {
    id: 'minLength',
    i18nKey: 'common.validation.password.rules.min-length',
    validate: (password) => password.length && password.length >= 8,
  },
  {
    id: 'containsUppercase',
    i18nKey: 'common.validation.password.rules.contains-uppercase',
    validate: (password) => /[A-ZÀ-ß]/.test(password),
  },
  {
    id: 'containsLowercase',
    i18nKey: 'common.validation.password.rules.contains-lowercase',
    validate: (password) => /[a-zà-ÿ]/.test(password),
  },
  {
    id: 'containsDigit',
    i18nKey: 'common.validation.password.rules.contains-digit',
    validate: (password) => /\d/.test(password),
  },
];

export function getInvalidRuleIds(rules, password) {
  return rules.filter((rule) => !rule.validate(password)).map((rule) => rule.id);
}

export default function isPasswordValid(password) {
  if (!password) {
    return false;
  }

  const invalidRules = getInvalidRuleIds(PASSWORD_RULES, password);
  return invalidRules.length === 0;
}
