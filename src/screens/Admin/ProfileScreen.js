import React from 'react';
import CompactProfile from '../../components/CompactProfile';

const AdminProfileScreen = ({ navigation }) => (
  <CompactProfile
    navigation={navigation}
    extraTiles={[{ icon: 'time-outline', title: 'Sign-in activity', subtitle: 'Recent logins', onPress: () => navigation.navigate('Activity') }]}
  />
);

export default AdminProfileScreen;
