import getModule from './get-module';

export default function index(config) {
  config.get('/modules/:slug', getModule);
}
