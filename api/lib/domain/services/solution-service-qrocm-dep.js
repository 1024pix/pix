/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
const utils = require('./solution-service-utils');
const yaml = require('js-yaml');
const _ = require('../../utils/lodash-utils');

module.exports = {

  match (yamlAnswer, yamlSolution, yamlScoring) {
    let result = 'ko';
    let answerMap = null;
    let solution = null;
    let scoring = null;

    try {
      answerMap = yaml.safeLoad(yamlAnswer);
      // answerMap is
      //{ num1: ' google.fr', num2: 'yahoo aNswer ' }

      solution = yaml.safeLoad(yamlSolution);
      // solution is
      // { Google: [ 'Google', 'google.fr', 'Google Search' ], Yahoo: [ 'Yahoo', 'Yahoo Answer' ] }

      scoring = yaml.safeLoad(yamlScoring);
      // scoring is
      // { 1: 'rechinfo1', 2: 'rechinfo2', 3: 'rechinfo3' }

    } catch (e) { // Parse exceptions like script injection could happen. They are detected here.
      return 'ko';
    }

    const possibleAnswers = {};
    _.each(solution, (answerList, solutionKey) => {
      _.each(answerList, (answer) => {
        possibleAnswers[answer] = solutionKey;
      });
    });
    // possibleAnswers is
    // { Google: 'Google','google.fr': 'Google','Google Search': 'Google',Yahoo: 'Yahoo','Yahoo Answer': 'Yahoo' }

    const scoredKeys = [];
    _.each(answerMap, (answer) => {
      _.each(possibleAnswers, (solutionKey, possibleAnswer) => {
        if(utils.fuzzyMatchingWithAnswers(answer, [possibleAnswer])) {
          scoredKeys.push(solutionKey);
        }
      });
    });
    // scoredKeys is
    // [ 'Google', 'Yahoo' ]

    const numberOfUserAnswers = Object.keys(answerMap).length;
    const numberOfUniqueCorrectAnswers = _.uniq(scoredKeys).length;

    if (_.isNotEmpty(scoring)) {

      const minGrade = _.min(Object.keys(scoring));
      const maxGrade = _.max(Object.keys(scoring));

      if (numberOfUniqueCorrectAnswers >= maxGrade) {
        result = 'ok';
      } else if (numberOfUniqueCorrectAnswers >= minGrade) {
        result = 'partially';
      }

    } else {

      if (_(numberOfUniqueCorrectAnswers).isEqual(numberOfUserAnswers)) {
        result = 'ok';
      }
    }

    return result;

  }

};
