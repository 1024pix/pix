import getModule from './get-module';
import submitAnswer from './submit-answer';
import createPassage from './create-passage';

export default function index(config) {
  config.get('/modules/:slug', getModule);
  config.post('/passages/:passageId/answers', submitAnswer);
  config.post('/passages', createPassage);
}
