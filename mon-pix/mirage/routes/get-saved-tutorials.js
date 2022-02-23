export default function index(config) {
  config.get('/users/tutorials/saved', (schema) => {
    return schema.tutorials.all();
  });
}
