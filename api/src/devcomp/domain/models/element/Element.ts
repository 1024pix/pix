export type ElementArgs = {
  id: string;
  type: string;
};

export class Element {
  id: string;
  type: string;
  isAnswerable: boolean;

  constructor({ id, type }: ElementArgs) {
    this.id = id;
    this.type = type;
    this.isAnswerable = false;
  }
}
