export default function index(config) {
  config.get('/users/tutorials/recommended', (schema) => {
    return schema.tutorials.all();
  });
}
