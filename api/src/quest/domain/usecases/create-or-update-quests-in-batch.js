/**
 * @typedef {import ('../usecases/index.js').QuestRepository} QuestRepository
 */
import { createReadStream } from 'node:fs';

import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { getDataBuffer } from '../../../shared/infrastructure/utils/buffer.js';
import { QUEST_HEADER } from '../constants.js';
import { Quest } from '../models/quests/entities/Quest.js';

export const createOrUpdateQuestsInBatch = withTransaction(
  /**
   * @param {Object} params - A parameter object.
   * @param {string} params.filePath - path of csv file which contains quests
   * @param {QuestRepository} params.questRepository - questRepository to use.
   * @param {QuestRepository} params.combinedCourseRepository - combinedCourseRepository to use.
   * @returns {Promise<void>}
   */
  async ({ filePath, questRepository, combinedCourseRepository }) => {
    const deleteQuestIds = [];
    const updatedOrNewQuest = [];

    const stream = createReadStream(filePath);
    const buffer = await getDataBuffer(stream);

    const csvParser = new CsvParser(buffer, QUEST_HEADER);
    const csvData = csvParser.parse();

    for (const { questId, content, deleteQuest } of csvData) {
      if (questId) {
        try {
          const isCombinedCourse = await combinedCourseRepository.getById({ id: questId });
          if (isCombinedCourse) {
            continue;
          }
        } catch (e) {
          if (!(e instanceof NotFoundError)) {
            throw Error;
          }
        }
      }

      if (deleteQuest?.toLowerCase() === 'oui' && questId) {
        deleteQuestIds.push(questId);
      } else {
        updatedOrNewQuest.push(new Quest({ id: questId || undefined, ...JSON.parse(content) }));
      }
    }

    if (deleteQuestIds.length > 0) {
      await questRepository.deleteByIds({ questIds: deleteQuestIds });
    }

    if (updatedOrNewQuest.length > 0) {
      await questRepository.saveInBatch({ quests: updatedOrNewQuest });
    }

    return true;
  },
);
