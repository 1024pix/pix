const yamljs = require('yamljs');
const _ = require('lodash');

function _getMailField(mail, field) {
  if(field === 'SUJET') {
    return mail.mail.subject;
  } else {
    return mail.mail.text;
  }
}

function _atLeastOneRuleIsValid(listOfRulesResults) {
  return listOfRulesResults.filter(value => value === true).length > 0;
}

function _allRulesAreValidated(listOfRulesResults) {
  return listOfRulesResults.filter(value => value === false).length === 0;
}

function _isEmailField(operator) {
  return operator === 'SUJET' || operator === 'CORPS';
}

function _isComparisonCondition(comparisonOperator) {
  return comparisonOperator === 'EST' || comparisonOperator === 'CONTIENT';
}

function _isLogicalCondition(logicalOperator) {
  return logicalOperator === 'OU' || logicalOperator === 'ET';
}

function _validRule(mail, field, validator, value) {
  const fieldUnderTest = _getMailField(mail, field);

  let result = false;
  if(validator === 'EST') {
    result = fieldUnderTest.trim() === value;
  } else if(validator === 'CONTIENT') {
    result = fieldUnderTest.includes(value);
  }

  return result;
}

function _validateRules(mail, currentOperator, rules, field) {

  const results = [];
  const subOperators = _.keys(rules);

  subOperators.forEach((operator) => {
    if(_isEmailField(operator)) {
      results.push(_validateRules(mail, currentOperator, rules[operator], operator));
    } else if(_isComparisonCondition(operator)) {
      results.push(_validRule(mail, field, operator, rules[operator]));
    } else if(_isLogicalCondition(operator)) {
      results.push(_validateRules(mail, operator, rules[operator], field));
    } else {
      // When the previous LogicalCondition (ie. ET) applies to many ComparisonCondition,
      // we iterate over the list of rules.
      results.push(_validateRules(mail, currentOperator, rules[operator], field));
    }
  });

  if(currentOperator === 'OU') {
    return _atLeastOneRuleIsValid(results);
  } else {
    return _allRulesAreValidated(results);
  }
}

module.exports = {
  validateEmail: (mail, rules) => {
    const parsedRules = yamljs.parse(rules);

    const initialCondition = _.keys(parsedRules)[0];

    const initialOperator = (initialCondition === 'OU' || initialCondition === 'ET') ? initialCondition : 'ET';

    return _validateRules(mail, initialOperator, parsedRules, null);
  }
};
