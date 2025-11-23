import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const PropertyPerformanceChart = ({ data, labels }) => {
    const screenWidth = Dimensions.get('window').width;

    const chartData = {
        labels: labels || ['Prop 1', 'Prop 2', 'Prop 3', 'Prop 4'],
        datasets: [
            {
                data: data || [35000, 45000, 38000, 42000],
            },
        ],
    };

    const chartConfig = {
        backgroundColor: '#0F172A',
        backgroundGradientFrom: '#0F172A',
        backgroundGradientTo: '#1E293B',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#1E293B',
        },
        barPercentage: 0.7,
    };

    return (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <BarChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={{
                    borderRadius: 16,
                }}
                showValuesOnTopOfBars
                fromZero
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

export default PropertyPerformanceChart;
