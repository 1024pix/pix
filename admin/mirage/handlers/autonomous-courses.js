export const findAutonomousCourseTargetProfiles = (schema) => {
  return schema.autonomousCourseTargetProfiles.all();
};

export const createAutonomousCourse = (schema, request) => {
  const params = JSON.parse(request.requestBody);

  return schema.create('autonomous-course', {
    ...params.data.attributes,
  });
};

export const getAutonomousCourseDetails = (schema, request) => {
  const autonomousCourseId = request.params.id;
  return schema.autonomousCourses.find(autonomousCourseId);
};
