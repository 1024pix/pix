export default function index(config) {
  config.get('/users/tutorials', { data: { id: 0, type: 'user-tutorials' } });
}
