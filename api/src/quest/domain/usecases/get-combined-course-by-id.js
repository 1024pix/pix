import { CombinedCourseDetails } from '../models/combined-course-participation/CombinedCourseDetails.js';

const getCombinedCourseById = async ({ combinedCourseId, combinedCourseRepository, questRepository }) => {
  const combinedCourse = await combinedCourseRepository.getById({ id: combinedCourseId });
  const quest = await questRepository.findById({ questId: combinedCourse.questId });

  return new CombinedCourseDetails(combinedCourse, quest);
};

export default getCombinedCourseById;
