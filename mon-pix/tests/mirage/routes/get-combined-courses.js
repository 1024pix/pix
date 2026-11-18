import { Response } from 'miragejs';

export default function (schema, request) {
  const code = request.queryParams['filter[code]'];

  const combinedCourse = schema.combinedCourses.findBy({ code });

  return combinedCourse ? combinedCourse : new Response(404);
}
