const updateAutonomousCourse = async ({ autonomousCourse, autonomousCourseRepository }) => {
  return autonomousCourseRepository.update({ autonomousCourse });
};

export { updateAutonomousCourse };
