import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const OccupancyPieChart = ({ occupied, vacant }) => {
    const screenWidth = Dimensions.get('window').width;

    const data = [
        {
            name: 'Occupied',
            population: occupied || 10,
            color: '#10B981',
            legendFontColor: '#94A3B8',
            legendFontSize: 12,
        },
        {
            name: 'Vacant',
            population: vacant || 2,
            color: '#64748B',
            legendFontColor: '#94A3B8',
            legendFontSize: 12,
        },
    ];

    const chartConfig = {
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };

    return (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <PieChart
                data={data}
                width={screenWidth - 40}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
                hasLegend={true}
            />
        </View>
    );
};

export default OccupancyPieChart;
