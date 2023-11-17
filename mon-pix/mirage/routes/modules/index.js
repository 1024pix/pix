import getModule from './get-module';
import submitAnswer from './submit-answer';

export default function index(config) {
  config.get('/modules/:slug', getModule);
  config.post('/modules/:slug/elements/:elementId/answers', submitAnswer);
}
