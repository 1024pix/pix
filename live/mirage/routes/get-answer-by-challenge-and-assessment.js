import _               from 'lodash/lodash';

import rawQcmAnswer    from '../data/answers/raw-qcm-answer';
import refQcmAnswer    from '../data/answers/ref-qcm-answer';
import refQcuAnswer    from '../data/answers/ref-qcu-answer';
import refQrocAnswer   from '../data/answers/ref-qroc-answer';
import refQrocmAnswer  from '../data/answers/ref-qrocm-answer';

export default function (schema, request) {

  const allAnswers = [
    rawQcmAnswer,
    refQcuAnswer,
    refQcmAnswer,
    refQrocAnswer,
    refQrocmAnswer
  ];

  const answers = _.map(allAnswers, function(oneAnswer) {
    return {id: oneAnswer.data.id, obj: oneAnswer};
  });

  const answer = _.find(answers, 
    function(oneAnswer) {
      const belongsToAssessment = 
        _.get(oneAnswer.obj, 'data.relationships.assessment.data.id') === request.queryParams.assessment;
      const belongsToChallenge = 
        _.get(oneAnswer.obj, 'data.relationships.challenge.data.id') === request.queryParams.challenge;
      return belongsToAssessment && belongsToChallenge;
    });

  if (answer) {
    return answer.obj;
  } else {
    let queryParams = '';
    try {
      queryParams = JSON.stringify(request.queryParams);
    } catch(e) {
      queryParams = '';
    }
    throw new Error('404 The answer you required in the fake server does not exist... ' + queryParams);
  }


}
