import { CombinedCourseDetails } from '../models/CombinedCourse.js';

const getCombinedCourseByQuestId = async ({ questId, combinedCourseRepository, questRepository }) => {
  const quest = await questRepository.findById({ questId });
  const combinedCourse = await combinedCourseRepository.getById({ id: questId });

  return new CombinedCourseDetails(combinedCourse, quest);
};

export default getCombinedCourseByQuestId;
