import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';

// Design System inspired palette
const COLORS = ['#005EA8', '#0F9D58', '#004C8A', '#6B7280', '#D1E4F9', '#82ca9d', '#8884d8'];

const StatusDashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/expenses/');
                setExpenses(response.data);
            } catch (error) {
                console.error('Error fetching expenses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const processData = (key, nestedKey) => {
        const data = {};
        expenses.forEach(item => {
            const label = nestedKey ? (item[key]?.[nestedKey] || 'Uncategorized') : (item[key] || 'Uncategorized');
            data[label] = (data[label] || 0) + item.amount;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    };

    const categoryData = useMemo(() => processData('category', 'title'), [expenses]);
    const phaseData = useMemo(() => processData('phase', 'title'), [expenses]);
    const subCategoryData = useMemo(() => processData('sub_category', 'title'), [expenses]);

    const timeSeriesData = useMemo(() => {
        const data = {};
        expenses.forEach(item => {
            const date = item.purchase_date; // Assuming YYYY-MM-DD
            data[date] = (data[date] || 0) + item.amount;
        });
        // Sort by date
        return Object.entries(data)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, amount]) => ({ date, amount }));
    }, [expenses]);

    if (loading) return (
        <Layout>
            <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading visuals...</div>
        </Layout>
    );

    const renderPieChart = (title, data) => (
        <Card className="flex flex-col min-h-[400px]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 text-center">{title}</h3>
            <div className="flex-1 w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );

    return (
        <Layout>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Financial Status</h2>

                {/* Time Series */}
                <Card>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Investment Timeline</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                                <YAxis stroke="var(--color-text-secondary)" />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="var(--color-primary)"
                                    strokeWidth={2}
                                    activeDot={{ r: 6, fill: 'var(--color-primary)' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Pie Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderPieChart("Investments by Category", categoryData)}
                    {renderPieChart("Investments by Phase", phaseData)}
                    {renderPieChart("Investments by Sub-Category", subCategoryData)}
                </div>
            </div>
        </Layout>
    );
};

export default StatusDashboard;
