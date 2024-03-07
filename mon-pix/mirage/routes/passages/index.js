import createPassage from './create-passage';
import submitAnswer from './submit-answer';
import terminatePassage from './terminate-passage';

export default function index(config) {
  config.post('/passages', createPassage);
  config.post('/passages/:passageId/answers', submitAnswer);
  config.post('/passages/:passageId/terminate', terminatePassage);
}
