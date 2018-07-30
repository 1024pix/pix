export default {
  data: {
    type: 'assessments',
    id: 'ref_assessment_campaign_id',
    attributes: {
      'type':'SMART_PLACEMENT'
    },
    relationships: {
      course: {
        data: {
          type: 'courses',
          id: 'campaign-course'
        }
      },
    }
  }
};
