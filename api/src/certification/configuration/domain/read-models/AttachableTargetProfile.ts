type AttachableTargetProfileProps = {
  id: number;
  name: string;
};

export class AttachableTargetProfile {
  readonly id;
  readonly name;
  constructor({ id, name }: AttachableTargetProfileProps) {
    this.id = id;
    this.name = name;
  }
}
