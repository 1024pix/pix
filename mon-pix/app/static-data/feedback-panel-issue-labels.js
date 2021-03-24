const topLevelLabels = [
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.question',
    value: 'question',
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.picture',
    value: 'picture',
    displayOnlyOnChallengePage: true,
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.link',
    value: 'link',
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.embed',
    value: 'embed',
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.download',
    value: 'download',
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility',
    value: 'accessibility',
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.answer',
    value: 'answer',
    displayOnlyOnComparisonWindow: true,
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.tutorial',
    value: 'tutorial',
    displayOnlyOnComparisonWindow: true,
  },
  {
    name: 'pages.challenge.feedback-panel.form.fields.category-selection.options.other',
    value: 'other',
  },
];

const questions = {
  'question': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.question-not-understood',
      type: 'textbox',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.question-improvement',
      type: 'textbox',
    },
  ],
  'picture': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.picture-not-displayed.label',
      type: 'tutorial',
      content: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.picture-not-displayed.solution',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.picture-other',
      type: 'textbox',
    },
  ],
  'link': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.link-unauthorized.label',
      type: 'tutorial',
      content: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.link-unauthorized.solution',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.link-other',
      type: 'textbox',
    },
  ],
  'embed': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.embed-not-displayed.label',
      type: 'tutorial',
      content: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.embed-not-displayed.solution',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.embed-other',
      type: 'textbox',
    },
  ],
  'download': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.download.open-failure.label',
      type: 'tutorial',
      content: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.download.open-failure.solution',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.download.lost.label',
      type: 'tutorial',
      content: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.download.lost.solution',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.download.edit-failure.label',
      type: 'tutorial',
      content: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.download.edit-failure.solution',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.download.other',
      type: 'textbox',
    },
  ],
  'accessibility': [
    {
      name: 'link',
      type: 'textbox',
    },
  ],
  'answer': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.answer-not-accepted',
      type: 'textbox',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.answer-not-agreed',
      type: 'textbox',
    },
  ],
  'tutorial': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.tutorial-not-accepted',
      type: 'textbox',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.tutorial-link-error',
      type: 'textbox',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.tutorial-proposal',
      type: 'textbox',
    },
  ],
  'other': [
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.other-challenge-proposal',
      type: 'textbox',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.other-site-improvement',
      type: 'textbox',
    },
    {
      name: 'pages.challenge.feedback-panel.form.fields.detail-selection.options.other-difficulty',
      type: 'textbox',
    },
  ],
};

export { topLevelLabels, questions };
