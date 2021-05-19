import Component from '@glimmer/component';

export default class TestChart extends Component {
  get data() {
    return {
      labels: ['January', 'February', 'March', 'April'],
      datasets: [
        {
          type: 'line',
          label: 'line 1 Dataset',
          data: [10, 20, 30, 40],
          borderColor: 'rgb(99, 255, 132)',
          backgroundColor: 'rgba(99, 255, 132, 0.5)',
          fill: 'origin',
        },
        {
          type: 'line',
          label: 'Line 2 Dataset',
          data: [20, 30, 50, 40],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: '0',
        },
      ],
    };
  }

  get options() {
    return {
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }
}
