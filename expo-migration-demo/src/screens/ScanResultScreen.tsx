import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHistory } from '../hooks/useHistory';

const ScanResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { scanId } = route.params;
  const { getHistoryItem, removeFromHistory } = useHistory();

  const scanResult = getHistoryItem(scanId);

  if (!scanResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Scan result not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan result?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await removeFromHistory(scanId);
            navigation.goBack();
          }
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image 
          source={{ uri: scanResult.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{scanResult.productName}</Text>
          <Text style={styles.scanDate}>Scanned on {formatDate(scanResult.timestamp)}</Text>

          {/* Safety Status */}
          <View style={[
            styles.safetyCard,
            { backgroundColor: scanResult.isSafe ? '#dcfce7' : '#fee2e2' }
          ]}>
            <Text style={[
              styles.safetyStatus,
              { color: scanResult.isSafe ? '#166534' : '#dc2626' }
            ]}>
              {scanResult.isSafe ? '✅ Safe to consume' : '⚠️ Contains allergens'}
            </Text>
            <Text style={[
              styles.safetyDescription,
              { color: scanResult.isSafe ? '#166534' : '#dc2626' }
            ]}>
              {scanResult.isSafe 
                ? 'No detected allergens match your restrictions'
                : 'Found ingredients that may cause reactions'
              }
            </Text>
          </View>

          {/* Detected Allergens */}
          {scanResult.detectedAllergens.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Allergens</Text>
              {scanResult.detectedAllergens.map((allergen, index) => (
                <View key={index} style={[
                  styles.allergenCard,
                  { backgroundColor: allergen.severity === 'unsafe' ? '#fee2e2' : '#fef3c7' }
                ]}>
                  <View style={styles.allergenHeader}>
                    <Text style={styles.allergenName}>{allergen.name}</Text>
                    <Text style={[
                      styles.severityBadge,
                      { 
                        backgroundColor: allergen.severity === 'unsafe' ? '#dc2626' : '#f59e0b',
                        color: 'white'
                      }
                    ]}>
                      {allergen.severity === 'unsafe' ? 'UNSAFE' : 'CAUTION'}
                    </Text>
                  </View>
                  <Text style={styles.allergenFound}>Found: {allergen.found}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients Analysis</Text>
            <View style={styles.ingredientsCard}>
              <Text style={styles.ingredientsText}>{scanResult.ingredients}</Text>
            </View>
          </View>

          {/* Recommendation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendation</Text>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationText}>{scanResult.recommendation}</Text>
            </View>
          </View>

          {/* Alternative Suggestion */}
          {scanResult.alternativeSuggestion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alternative Suggestions</Text>
              <View style={styles.alternativeCard}>
                <Text style={styles.alternativeText}>{scanResult.alternativeSuggestion}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.newScanButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.newScanButtonText}>New Scan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  scanDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  safetyCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  safetyStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  safetyDescription: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  allergenCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  allergenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  allergenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  allergenFound: {
    fontSize: 14,
    color: '#4b5563',
  },
  ingredientsCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ingredientsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: '#ede9fe',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  recommendationText: {
    fontSize: 14,
    color: '#5b21b6',
    lineHeight: 20,
  },
  alternativeCard: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  alternativeText: {
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  newScanButton: {
    flex: 2,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newScanButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ScanResultScreen;