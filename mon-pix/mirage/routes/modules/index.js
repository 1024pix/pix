import getModule from './get-module';

export default function index(config) {
  config.get('/modules/v2/:shortId', getModule);
}
