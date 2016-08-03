export default function () {

  this.urlPrefix = 'http://localhost:4200';
  this.namespace = 'api/live';

  this.get('/courses');
  this.get('/courses/:id');
  this.post('/assessments', function(schema) {
    const attrs = this.normalizedRequestAttrs();
    return schema.assessments.create({ course: schema.courses.find(attrs.course) });
  });
  this.get('/assessments/:id');

  this.get('/challenges/:id');
}
