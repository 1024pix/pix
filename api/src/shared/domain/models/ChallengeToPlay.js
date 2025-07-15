export class ChallengeToPlay {
  constructor({
    id,
    type,
    instruction,
    proposals,
    timer,
    illustrationUrl,
    attachments,
    competenceId,
    embedUrl,
    embedTitle,
    embedHeight,
    webComponentTagName,
    webComponentProps,
    illustrationAlt,
    format,
    autoReply,
    alternativeInstruction,
    focused,
    shuffled,
    locales,
  }) {
    this.id = id;
    this.type = type;
    this.instruction = instruction;
    this.proposals = proposals;
    this.timer = timer;
    this.illustrationUrl = illustrationUrl;
    this.attachments = attachments;
    this.competenceId = competenceId;
    this.embedUrl = embedUrl;
    this.embedTitle = embedTitle;
    this.embedHeight = embedHeight;
    this.webComponentTagName = webComponentTagName;
    this.webComponentProps = webComponentProps;
    this.illustrationAlt = illustrationAlt;
    this.format = format;
    this.autoReply = autoReply;
    this.alternativeInstruction = alternativeInstruction;
    this.focused = focused;
    this.shuffled = shuffled;
    this.locales = locales;
  }

  static fromLearningContentApiDtos(challengeApiDto, webComponentInfoApiDto) {
    return new ChallengeToPlay({
      id: challengeApiDto.id,
      type: challengeApiDto.type,
      instruction: challengeApiDto.instruction,
      proposals: challengeApiDto.proposals,
      timer: challengeApiDto.timer,
      illustrationUrl: challengeApiDto.illustrationUrl,
      attachments: challengeApiDto.attachments,
      competenceId: challengeApiDto.competenceId,
      embedUrl: challengeApiDto.embedUrl,
      embedTitle: challengeApiDto.embedTitle,
      embedHeight: challengeApiDto.embedHeight,
      webComponentTagName: webComponentInfoApiDto.webComponentTagName,
      webComponentProps: webComponentInfoApiDto.webComponentProps,
      illustrationAlt: challengeApiDto.illustrationAlt,
      format: challengeApiDto.format,
      autoReply: challengeApiDto.autoReply,
      alternativeInstruction: challengeApiDto.alternativeInstruction,
      focused: challengeApiDto.focused,
      shuffled: challengeApiDto.shuffled,
      locales: challengeApiDto.locales,
    });
  }
}
