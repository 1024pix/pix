export const TYPES = {
  SKILL: 'skill',
};

export class Success {
  constructor({ knowledgeElements }) {
    this.knowledgeElements = knowledgeElements;
  }
}
