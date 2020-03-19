import postAuthentications from './post-authentications';

export default function index(config) {
  config.post('/revoke', () => {});

  config.post('/token', postAuthentications);
}
