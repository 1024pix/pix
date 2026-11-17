type Props = {
  id: number;
};

export class Learner {
  readonly id: number;
  constructor(props: Props) {
    this.id = props.id;
  }
}
