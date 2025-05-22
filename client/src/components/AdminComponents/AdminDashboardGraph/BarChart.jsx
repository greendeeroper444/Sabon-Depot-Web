import React, { useRef, useEffect, useMemo } from 'react'
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const BarChart = ({salesData, chartOptions}) => {
    const chartRef = useRef(null);
    const gradientRef = useRef(null);

    // Memoize the chart data to prevent unnecessary re-renders
    const chartData = useMemo(() => {
        return {
            ...salesData,
            datasets: salesData.datasets.map(dataset => ({
                ...dataset,
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const {ctx: canvasCtx, chartArea} = chart;
                    
                    if (!chartArea) {
                        return '#00ff6a';
                    }
                    
                    // Create or reuse gradient
                    if (!gradientRef.current || gradientRef.current.canvas !== canvasCtx.canvas) {
                        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, '#00ff6a');
                        gradient.addColorStop(1, '#006633');
                        gradientRef.current = gradient;
                    }
                    
                    return gradientRef.current;
                },
                barThickness: 10,
            })),
        };
    }, [salesData]);

    const updatedOptions = useMemo(() => ({
        ...chartOptions,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                barPercentage: 0.5,
                categoryPercentage: 0.8,
            },
            y: {
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
    }), [chartOptions]);

    return (
        <Bar
        ref={chartRef}
        data={chartData}
        options={updatedOptions}
        className='admin-sales-chart'
        />
    )
}

export default BarChart