import postAuthentications from './post-authentications';

export default function index(config) {
  config.post('/token', postAuthentications);
  config.post('/revoke', () => {});
}
