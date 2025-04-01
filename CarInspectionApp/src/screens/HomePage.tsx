import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomePage = ({ navigation }) => {
  const inspectionSteps = [
    {
      icon: 'car',
      title: 'Body & Exterior',
      description: 'Panel gaps & alignment, Paint condition & overspray, Rust & corrosion assessment, Previous accident damage',
    },
    {
      icon: 'cogs',
      title: 'Interior Assessment',
      description: 'Upholstery & trim condition, Electronic systems check, Hidden moisture damage, Safety equipment verification',
    },
    {
      icon: 'tools',
      title: 'Mechanical Inspection',
      description: 'Engine performance assessment, Transmission & clutch check, Suspension & steering, Fluid leaks & condition',
    },
    {
      icon: 'road',
      title: 'Road Test',
      description: 'Acceleration & braking, Handling & stability, Unusual noises & vibrations, Overall driving performance',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={require('../assets/car-background.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Car Inspection App</Text>
          <Text style={styles.subHeaderText}>
            Professional vehicle assessment at your fingertips
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.inspectionProcess}>
        <Text style={styles.sectionTitle}>Our Inspection Process</Text>
        <View style={styles.stepsContainer}>
          {inspectionSteps.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={styles.stepCard}
              onPress={() => navigation.navigate('InspectionDetail', { step })}
            >
              <Icon name={step.icon} size={40} color="#4a90e2" />
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backgroundImage: {
    height: 300,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 18,
    color: 'white',
  },
  inspectionProcess: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'column',
  },
  stepCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  stepDescription: {
    textAlign: 'center',
    color: '#666',
  },
});

export default HomePage;
