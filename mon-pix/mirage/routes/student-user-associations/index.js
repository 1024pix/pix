import { Response } from 'ember-cli-mirage';

export default function index(config) {
  config.get('/student-user-associations', (schema, request) => {
    const userId =  request.queryParams.userId;
    const student = schema.students.findBy({ userId });
    return student ? student : { data: null };
  });
  config.post('/student-user-associations', () => {
    return new Response(204);
  });

  config.put('/student-user-associations/possibilities', () => {
    return new Response(204);
  });
}
