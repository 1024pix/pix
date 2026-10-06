export type CappedTubeArgs = {
  id: string;
  level: number;
};

export class CappedTube {
  id: string;
  level: number;

  constructor({ id, level }: CappedTubeArgs) {
    this.id = id;
    this.level = level;
  }
}
