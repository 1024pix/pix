import _ from 'pix-live/utils/lodash-custom';

import rawQcmAnswer    from '../data/answers/raw-qcm-answer';
import refQcmAnswer    from '../data/answers/ref-qcm-answer';
import refQcuAnswer    from '../data/answers/ref-qcu-answer';
import refQruAnswer    from '../data/answers/ref-qru-answer';
import refQrocAnswer   from '../data/answers/ref-qroc-answer';
import refQrocmAnswer  from '../data/answers/ref-qrocm-answer';
import noFileAnswer    from '../data/answers/no-file-answer';
import oneFileAnswer from '../data/answers/one-file-answer';
import multipleFilesAnswer from '../data/answers/multiple-files-answer';

export default function (schema, request) {

  const allAnswers = [
    rawQcmAnswer,
    refQcuAnswer,
    refQruAnswer,
    refQcmAnswer,
    refQrocAnswer,
    refQrocmAnswer,
    noFileAnswer,
    oneFileAnswer,
    multipleFilesAnswer
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
