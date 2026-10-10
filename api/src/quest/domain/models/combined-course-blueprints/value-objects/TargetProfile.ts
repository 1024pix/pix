export type TargetProfileArgs = {
  id: number;
  name: string;
  internalName: string;
};

export class TargetProfile {
  id: number;
  name: string;
  internalName: string;

  constructor({ id, name, internalName }: TargetProfileArgs) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
  }
}
