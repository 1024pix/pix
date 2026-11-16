const topLevelLabels = [
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.question',
    value: 'question',
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.picture',
    value: 'picture',
    displayOnlyOnChallengePage: true,
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.link',
    value: 'link',
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.embed',
    value: 'embed',
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.download',
    value: 'download',
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.accessibility',
    value: 'accessibility',
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.answer',
    value: 'answer',
    displayOnlyOnComparisonWindow: true,
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.tutorial',
    value: 'tutorial',
    displayOnlyOnComparisonWindow: true,
  },
  {
    name: 'components.challenge.feedback-panel.form.fields.category-selection.options.other',
    value: 'other',
  },
];

const questions = {
  question: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.question-not-understood',
      type: 'textbox',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.question-improvement',
      type: 'textbox',
    },
  ],
  picture: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.picture-not-displayed.label',
      type: 'tutorial',
      content:
        'components.challenge.feedback-panel.form.fields.detail-selection.options.picture-not-displayed.solution',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.picture-other',
      type: 'textbox',
    },
  ],
  link: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.link-unauthorized.label',
      type: 'tutorial',
      content: 'components.challenge.feedback-panel.form.fields.detail-selection.options.link-unauthorized.solution',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.link-other',
      type: 'textbox',
    },
  ],
  embed: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.embed-not-displayed.label',
      type: 'tutorial',
      content: 'components.challenge.feedback-panel.form.fields.detail-selection.options.embed-not-displayed.solution',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.embed-other',
      type: 'textbox',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.embed-displayed-on-desktop-with-problems.label',
      type: 'tutorialAndTextbox',
      content:
        'components.challenge.feedback-panel.form.fields.detail-selection.options.embed-displayed-on-desktop-with-problems.solution',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.embed-displayed-on-mobile-devices-with-problems.label',
      type: 'tutorialAndTextbox',
      content:
        'components.challenge.feedback-panel.form.fields.detail-selection.options.embed-displayed-on-mobile-devices-with-problems.solution',
    },
  ],
  download: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.download.open-failure.label',
      type: 'tutorial',
      content:
        'components.challenge.feedback-panel.form.fields.detail-selection.options.download.open-failure.solution',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.download.lost.label',
      type: 'tutorial',
      content: 'components.challenge.feedback-panel.form.fields.detail-selection.options.download.lost.solution',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.download.edit-failure.label',
      type: 'tutorial',
      content:
        'components.challenge.feedback-panel.form.fields.detail-selection.options.download.edit-failure.solution',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.download.other',
      type: 'textbox',
    },
  ],
  accessibility: [
    {
      name: 'link',
      type: 'textbox',
    },
  ],
  answer: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.answer-not-accepted',
      type: 'textbox',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.answer-not-agreed',
      type: 'textbox',
    },
  ],
  tutorial: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.tutorial-not-accepted',
      type: 'textbox',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.tutorial-link-error',
      type: 'textbox',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.tutorial-proposal',
      type: 'textbox',
    },
  ],
  other: [
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.other-challenge-proposal',
      type: 'textbox',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.other-site-improvement',
      type: 'textbox',
    },
    {
      name: 'components.challenge.feedback-panel.form.fields.detail-selection.options.other-difficulty',
      type: 'textbox',
    },
  ],
};

export { questions, topLevelLabels };
