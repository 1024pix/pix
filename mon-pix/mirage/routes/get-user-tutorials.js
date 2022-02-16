export default function index(config) {
  config.get('/users/tutorials', (schema) => {
    return schema.tutorials.findOrCreateBy({ id: 0 });
  });
}
