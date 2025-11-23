import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const IncomeExpenseChart = ({ incomeData, expenseData, labels }) => {
    const screenWidth = Dimensions.get('window').width;

    const data = {
        labels: labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: incomeData || [445000, 450000, 440000, 460000, 455000, 465000],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for income
                strokeWidth: 3,
            },
            {
                data: expenseData || [40000, 35000, 45000, 38000, 42000, 40000],
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
                strokeWidth: 3,
            },
        ],
        legend: ['Income', 'Expenses'],
    };

    const chartConfig = {
        backgroundColor: '#0F172A',
        backgroundGradientFrom: '#0F172A',
        backgroundGradientTo: '#1E293B',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#0F172A',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#1E293B',
        },
    };

    return (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <LineChart
                data={data}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                    borderRadius: 16,
                }}
                withInnerLines
                withOuterLines
                withVerticalLabels
                withHorizontalLabels
                withVerticalLines={false}
                withHorizontalLines
                formatYLabel={(value) => {
                    const num = parseFloat(value);
                    if (num >= 1000) {
                        return `${(num / 1000).toFixed(0)}K`;
                    }
                    return value;
                }}
            />
        </View>
    );
};

export default IncomeExpenseChart;
