export default [
  {
    name: 'hasEmbed',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const embedUrl = cache.get(challenge, 'embedUrl');
      const embedTitle = cache.get(challenge, 'embedTitle');
      const hasWebComponent = cache.get(challenge, 'hasWebComponent');
      return !!embedUrl && !!embedTitle && !hasWebComponent && embedUrl.toLowerCase().indexOf('https://') === 0; // fixes bug on IE: startsWith in not supported (PR #242)
    },
  },
  {
    name: 'isEmbedGDevelop',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const embedUrl = cache.get(challenge, 'embedUrl');
      const hasEmbed = cache.get(challenge, 'hasEmbed');
      return hasEmbed ? embedUrl.toLowerCase().indexOf('https://1024pix.github.io/') === 0 : false;
    },
  },
  {
    name: 'hasWebComponent',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const webComponentProps = cache.get(challenge, 'webComponentProps');
      const webComponentTagName = cache.get(challenge, 'webComponentTagName');
      return !!webComponentProps && !!webComponentTagName;
    },
  },
  {
    name: 'isQROCDerivation',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const autoReply = cache.get(challenge, 'autoReply');
      const type = cache.get(challenge, 'type');
      return autoReply === false && type === 'QROC';
    },
  },
  {
    name: 'isQROCM',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const autoReply = cache.get(challenge, 'autoReply');
      const type = cache.get(challenge, 'type');
      return autoReply === false && (type === 'QROCM-dep' || type === 'QROCM-ind');
    },
  },

  {
    name: 'isQCUDerivation',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const autoReply = cache.get(challenge, 'autoReply');
      const type = cache.get(challenge, 'type');
      return autoReply === false && type === 'QCU';
    },
  },
  {
    name: 'isQCMDerivation',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const autoReply = cache.get(challenge, 'autoReply');
      const type = cache.get(challenge, 'type');
      return autoReply === false && (type === 'QCM' || type === 'QCMIMG');
    },
  },
  {
    name: 'hasFormCDerivation',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const isQROC = cache.get(challenge, 'isQROC');
      const isQROCM = cache.get(challenge, 'isQROCM');
      const isQCM = cache.get(challenge, 'isQCM');
      const isQCU = cache.get(challenge, 'isQCU');

      return isQROC || isQROCM || isQCM || isQCU;
    },
  },
  {
    name: 'hasFormCDerivation',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const isQROC = cache.get(challenge, 'isQROC');
      const isQROCM = cache.get(challenge, 'isQROCM');
      const isQCM = cache.get(challenge, 'isQCM');
      const isQCU = cache.get(challenge, 'isQCU');

      return isQROC || isQROCM || isQCM || isQCU;
    },
  },
  {
    name: 'hasTypeDerivation',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const type = cache.get(challenge, 'type');
      return !!type;
    },
  },
  {
    name: 'hasMediaDerivation',
    kind: 'derived',
    type: 'boolean',
    compute(challenge, cache) {
      const illustrationUrl = cache.get(challenge, 'illustrationUrl');
      const hasEmbed = cache.get(challenge, 'hasEmbed');
      const hasWebComponent = cache.get(challenge, 'hasWebComponent');

      return illustrationUrl || hasEmbed || hasWebComponent;
    },
  },
];
