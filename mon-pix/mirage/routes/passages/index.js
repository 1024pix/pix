import createPassage from './create-passage';
import onElementAnswer from './submit-answer';
import terminatePassage from './terminate-passage';

export default function index(config) {
  config.post('/passages', createPassage);
  config.post('/passages/:passageId/answers', onElementAnswer);
  config.post('/passages/:passageId/terminate', terminatePassage);
}
