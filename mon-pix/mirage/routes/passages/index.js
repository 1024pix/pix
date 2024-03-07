import submitAnswer from './submit-answer';
import createPassage from './create-passage';

export default function index(config) {
  config.post('/passages/:passageId/answers', submitAnswer);
  config.post('/passages', createPassage);
}
