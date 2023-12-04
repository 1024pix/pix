export const findAutonomousCourseTargetProfiles = (schema) => {
  return schema.autonomousCourseTargetProfiles.all();
};

export const createAutonomousCourse = (schema, request) => {
  const params = JSON.parse(request.requestBody);

  return schema.create('autonomous-course', {
    ...params.data.attributes,
  });
};
