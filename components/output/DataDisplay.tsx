
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pill, MessageSquare } from 'lucide-react';
import type { DailyData } from '../../types';

interface DataDisplayProps {
    selectedDate: string;
}

interface ChartDataPoint {
    time: string;
    value: number | null;
    medications: string[];
    comments: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                <p className="font-bold text-slate-800">{`Hora: ${label}`}</p>
                <p className="text-blue-600">{`Valor: ${data.value}`}</p>
                {data.medications.length > 0 && (
                    <div className="mt-2">
                        <p className="font-semibold text-slate-700">Medicación:</p>
                        <ul className="list-disc list-inside text-slate-600">
                            {data.medications.map((med: string) => <li key={med}>{med}</li>)}
                        </ul>
                    </div>
                )}
                {data.comments && <p className="mt-2 text-slate-600">{`Comentario: ${data.comments}`}</p>}
            </div>
        );
    }
    return null;
};


interface CustomTickProps {
    x?: number;
    y?: number;
    payload?: any;
    data: DailyData;
}

const CustomXAxisTick: React.FC<CustomTickProps> = ({ x, y, payload, data }) => {
    if (!payload || !data) return null;

    const time = payload.value;
    const timeData = data[time];
    const hasMeds = timeData && timeData.medications.length > 0;
    const hasComments = timeData && timeData.comments;

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
                {time.endsWith(':00') ? time : ''}
            </text>
            <g transform="translate(0, 20)">
                {hasMeds && (
                    <foreignObject x={-20} y={0} width={16} height={16} className="group cursor-pointer">
                        <Pill size={16} className="text-green-500" />
                        <div className="absolute bottom-full mb-2 w-max p-2 text-xs text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {timeData.medications.join(', ')}
                        </div>
                    </foreignObject>
                )}
                 {hasComments && (
                    <foreignObject x={hasMeds ? 0 : -8} y={0} width={16} height={16} className="group cursor-pointer">
                        <MessageSquare size={16} className="text-orange-500" />
                         <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {timeData.comments}
                        </div>
                    </foreignObject>
                )}
            </g>
        </g>
    );
};

export default function DataDisplay({ selectedDate }: DataDisplayProps) {
    const { healthData } = useAppContext();
    const dailyData = healthData[selectedDate];

    if (!dailyData || Object.values(dailyData).every(d => d.value === null)) {
        return <div className="flex items-center justify-center h-96 text-slate-500">No hay datos de valor numérico para mostrar en el gráfico de este día.</div>;
    }

    const chartData: ChartDataPoint[] = Object.entries(dailyData)
        .map(([time, data]) => ({
            time,
            value: data.value,
            medications: data.medications,
            comments: data.comments,
        }))
        .sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="h-[60vh] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 40,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" height={60} tick={<CustomXAxisTick data={dailyData}/>} interval={1}/>
                    <YAxis domain={[0, 10]} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Valor" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} connectNulls />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
