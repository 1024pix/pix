import { applyEmberDataSerializers, discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer, Response } from 'miragejs';

export default function makeServer(config) {
  const finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(config.store), ...config.models },
    serializers: applyEmberDataSerializers(config.serializers),
    routes,
    logging: true,
    urlPrefix: 'http://localhost:3000',
  };

  return createServer(finalConfig);
}

function routes() {
  this.namespace = 'api/pix1d';
  this.timing = 0; // response delay

  this.get('/missions/:mission_id', (schema, request) => {
    return schema.missions.find(request.params.mission_id);
  });

  this.get('/missions', (schema) => {
    return schema.missions.all();
  });

  this.post('/assessments', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    if (!params.missionId || !params.learnerId) {
      return new Response(400, {}, { errors: ['Missing params'] });
    }
    return schema.assessments.create({ missionId: params.missionId, type: 'PIX1D_MISSION' });
  });

  this.get('/assessments/:assessment_id', (schema, request) => {
    return schema.assessments.find(request.params.assessment_id);
  });

  this.get('/assessments/:assessment_id/next', (schema) => {
    if (!schema.activityAnswers.find(1)) {
      return schema.challenges.find(1);
    }
    return schema.challenges.find(2);
  });

  this.get('/assessments/:assessment_id/current-activity', (schema, request) => {
    if (schema.activities.first()) {
      return schema.activities.first();
    } else {
      return schema.activities.create({ assessmentId: request.params.assessment_id });
    }
  });

  this.post('/activity-answers', (schema, request) => {
    const options = JSON.parse(request.requestBody).meta;

    // we allow *exclusively* one or the other
    if (options?.assessmentId ^ options?.isPreview) {
      const answerValue = JSON.parse(request.requestBody).data.attributes?.value;
      const isCorrectAnswer = answerValue !== 'bad-answer' && answerValue !== '666';

      return schema.create('activity-answer', {
        result: answerValue === '#ABAND#' ? 'aband' : isCorrectAnswer ? 'ok' : 'ko',
        value: answerValue,
      });
    }
    return new Response(400);
  });

  this.get('/challenges/:challenge_id', (schema, request) => {
    return schema.challenges.find(request.params.challenge_id);
  });

  this.get('/schools', (schema, request) => {
    if (request.queryParams.code === 'MINIPIXOU') {
      return schema.schools.first();
    }
    return new Response(404);
  });

  this.get('/organization-learners/:id', (schema, request) => {
    const learner = schema.organizationLearners.find(request.params.id);
    if (learner) return learner;
    return schema.create('organization-learner', { completedMissionIds: [] });
  });
}
