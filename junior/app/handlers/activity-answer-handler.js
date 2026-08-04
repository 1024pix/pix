export const ActivityAnswerHandler = {
  request(context, next) {
    const { body, op, options, records } = context.request;

    if (op === 'createRecord' && records[0]?.type === 'activity-answer' && options) {
      const meta = {};
      if (options.assessmentId) {
        meta.assessmentId = options.assessmentId;
      }
      if (options.isPreview) {
        meta.isPreview = options.isPreview;
      }
      const payload = JSON.parse(body);
      payload.meta = meta;

      context.request.body = JSON.stringify(payload);
    }

    return next(context.request);
  },
};
