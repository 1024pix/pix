import { NotFoundError } from '../../../shared/domain/errors.js';
import { Module } from '../../domain/models/Module.js';
import { Text } from '../../domain/models/element/Text.js';
import { QCU } from '../../domain/models/element/QCU.js';
import { QcuProposal } from '../../domain/models/QcuProposal.js';
import { Grain } from '../../domain/models/Grain.js';
import { LearningContentResourceNotFound } from '../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { QCUForAnswerVerification } from '../../domain/models/element/QCU-for-answer-verification.js';

async function getBySlug({ slug, moduleDatasource }) {
  try {
    const moduleData = await moduleDatasource.getBySlug(slug);

    return _toDomain(moduleData);
  } catch (e) {
    if (e instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw e;
  }
}

async function getBySlugForVerification({ slug, moduleDatasource }) {
  try {
    const moduleData = await moduleDatasource.getBySlug(slug);

    return _toDomainForVerification(moduleData);
  } catch (e) {
    if (e instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw e;
  }
}

function _toDomain(moduleData) {
  return new Module({
    id: moduleData.id,
    slug: moduleData.slug,
    title: moduleData.title,
    grains: moduleData.grains.map((grain) => {
      return new Grain({
        id: grain.id,
        title: grain.title,
        type: grain.type,
        elements: grain.elements.map((element) => {
          if (element.type === 'qcu') {
            return new QCU({
              id: element.id,
              instruction: element.instruction,
              locales: element.locales,
              proposals: element.proposals.map((proposal) => {
                return new QcuProposal({
                  id: proposal.id,
                  content: proposal.content,
                });
              }),
            });
          }

          return new Text({
            id: element.id,
            content: element.content,
          });
        }),
      });
    }),
  });
}

function _toDomainForVerification(moduleData) {
  return new Module({
    id: moduleData.id,
    slug: moduleData.slug,
    title: moduleData.title,
    grains: moduleData.grains.map((grain) => {
      return new Grain({
        id: grain.id,
        title: grain.title,
        type: grain.type,
        elements: grain.elements.map((element) => {
          if (element.type === 'qcu') {
            return new QCUForAnswerVerification({
              id: element.id,
              instruction: element.instruction,
              locales: element.locales,
              proposals: element.proposals.map((proposal) => {
                return new QcuProposal({
                  id: proposal.id,
                  content: proposal.content,
                });
              }),
              feedbacks: element.feedbacks,
              solution: element.solution,
            });
          }

          return new Text({
            id: element.id,
            content: element.content,
          });
        }),
      });
    }),
  });
}

export { getBySlug, getBySlugForVerification };
