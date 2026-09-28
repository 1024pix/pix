export type TargetProfileType = {
  id: number;
  name: string;
  internalName: string;
};

export class TargetProfile {
  id: number;
  name: string;
  internalName: string;

  constructor({ id, name, internalName }: TargetProfileType) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
  }
}
