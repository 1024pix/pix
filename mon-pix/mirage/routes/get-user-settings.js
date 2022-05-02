export default function index(config) {
  config.get('/user-settings/:userId', () => {
    return {
      data: {
        id: 1,
        type: 'user-setting',
        attributes: {
          'created-at': '2020-12-11T14:30:40.109Z',
        },
      },
    };
  });
}
