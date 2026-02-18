import { Line } from "react-chartjs-2";
import { Chart, Filler } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import ProtoTypes from "prop-types";

Chart.register(Filler);
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const defaultOptions = {
  layout: {
    padding: {
      bottom: -20,
    },
  },
  maintainAspectRatio: false,
  aspectRatio: 1,
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: false,
      },
    },
  },

  plugins: {
    legend: {
      position: "top",
      display: false,
    },
    title: {
      display: false,
      text: "Visitor: 2k",
    },
    tooltip: {
      enabled: false,
    },
  },
};

const defaultLabels = ["asd", "dddfs", "dfdsf", "dsffs", "sfsd", "dsfds", "sdfdf"];

const defaultData = {
  labels: defaultLabels,
  datasets: [
    {
      data: [0, 10, 0, 65, 0, 25, 0, 35, 20, 100, 40, 75, 50, 85, 60],
      label: "Visitor",
      backgroundColor: ["rgba(34, 197, 94,0.41)", "rgba(255, 255, 255, 0)"],
      borderColor: "#22C55E",
      pointRadius: 0,
      pointBackgroundColor: "#fff",
      pointBorderColor: "#22C55E",
      borderWidth: 1,
      fill: true,
      fillColor: "#fff",
      tension: 0.4,
    },
  ],
};

function LineChart({ option, dataSet, plugins, refer }) {
  const options = option || defaultOptions;
  const data = dataSet || defaultData;

  return <Line options={options} data={data} plugins={plugins} ref={refer} />;
}

LineChart.propTypes = {
  option: ProtoTypes.object,
  dataSet: ProtoTypes.object,
  plugins: ProtoTypes.array,
  refer: ProtoTypes.object,
};

export default LineChart;
