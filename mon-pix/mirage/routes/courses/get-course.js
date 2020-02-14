export default function(schema, request) {
  const courseId = request.params.id;
  return schema.courses.find(courseId);
}
