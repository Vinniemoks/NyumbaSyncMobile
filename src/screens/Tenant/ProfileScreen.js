import React from 'react';
import CompactProfile from '../../components/CompactProfile';

const TenantProfileScreen = ({ navigation }) => (
  <CompactProfile
    navigation={navigation}
    extraTiles={[{ icon: 'document-text-outline', title: 'Documents', subtitle: 'Your files', onPress: () => navigation.navigate('Documents') }]}
  />
);

export default TenantProfileScreen;
