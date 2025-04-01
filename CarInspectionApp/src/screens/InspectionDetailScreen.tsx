import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

type RootStackParamList = {
  InspectionDetail: {
    step: {
      icon: string;
      title: string;
      description: string;
    };
  };
};

const InspectionDetailScreen = ({ route }: { route: RouteProp<RootStackParamList, 'InspectionDetail'> }) => {
  const { step } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Icon name={step.icon} size={60} color="#4a90e2" />
          <Text style={styles.title}>{step.title}</Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{step.description}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>What We Check</Text>
          {/* Add detailed information specific to each inspection type */}
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={20} color="#4a90e2" />
            <Text style={styles.infoText}>Comprehensive visual inspection</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={20} color="#4a90e2" />
            <Text style={styles.infoText}>Advanced diagnostic testing</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={20} color="#4a90e2" />
            <Text style={styles.infoText}>Professional assessment report</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={20} color="#4a90e2" />
            <Text style={styles.infoText}>Detailed recommendations</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  descriptionContainer: {
    padding: 20,
    backgroundColor: '#e8f4fd',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default InspectionDetailScreen;
