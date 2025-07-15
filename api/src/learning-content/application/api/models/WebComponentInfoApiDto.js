export class WebComponentInfoApiDto {
  constructor({ challengeId, webComponentTagName, webComponentProps }) {
    this.challengeId = challengeId;
    this.webComponentTagName = webComponentTagName;
    this.webComponentProps = webComponentProps;
  }
}
