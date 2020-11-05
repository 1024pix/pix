const Course = require('../../domain/models/Course');
const courseDatasource = require('../datasources/airtable/course-datasource');
const AirtableResourceNotFound = require('../datasources/airtable/AirtableResourceNotFound');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(courseDataObject) {
  return new Course({
    id: courseDataObject.id,
    name: courseDataObject.name,
    description: courseDataObject.description,
    imageUrl: courseDataObject.imageUrl,
    challenges: courseDataObject.challenges,
    competences: courseDataObject.competences,
    campaignId: courseDataObject.campaignId,
  });
}

async function _get(id) {
  try {
    const courseDataObject = await courseDatasource.get(id);
    return _toDomain(courseDataObject);
  }
  catch (error) {
    if (error instanceof AirtableResourceNotFound) {
      throw new NotFoundError();
    }
    throw error;
  }
}

async function _getByCampaignId(campaignId) {
  try {
    const courseDataObject = await courseDatasource.getByCampaignId(campaignId);
    return _toDomain(courseDataObject);
  }
  catch (error) {
    if (error instanceof AirtableResourceNotFound) {
      throw new NotFoundError();
    }
    throw error;
  }
}

module.exports = {

  async get(id) {
    return _get(id);
  },

  async getByCampaignId(campaignId) {
    return _getByCampaignId(campaignId);
  },

  async getCourseName(id) {
    try {
      const course = await _get(id);
      return course.name;
    } catch (err) {
      throw new NotFoundError('Le test demandé n\'existe pas');
    }
  },
};
