import React from 'react'
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const LineChart = ({salesData, chartOptions}) => {
    const updatedOptions = {
        ...chartOptions,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales?.y,
                beginAtZero: true,
                min: 0, // Prevent negative values on Y-axis
            }
        },
        plugins: {
            ...chartOptions.plugins,
            zoom: {
                limits: {
                    y: {min: 0, max: 'original'}, // Prevent zooming into negative Y values
                    x: {min: 'original', max: 'original'}
                },
                zoom: {
                    wheel: {
                        enabled: true,
                        speed: 0.1,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy',
                    drag: {
                        enabled: true,
                        backgroundColor: 'rgba(225,225,225,0.3)',
                        borderColor: 'rgba(225,225,225)',
                        borderWidth: 1,
                    }
                },
                pan: {
                    enabled: true,
                    mode: 'xy',
                    rangeMin: {
                        x: null,
                        y: 0 // Prevent panning below zero on Y-axis
                    },
                    rangeMax: {
                        x: null,
                        y: null
                    },
                }
            },
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        onHover: (event, activeElements, chart) => {
            if (event.native?.target) {
                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'grab';
            }
        }
    };

  return (
       <Line 
        data={salesData} 
        options={updatedOptions} 
        className='admin-sales-chart' 
        />
  )
}

export default LineChart