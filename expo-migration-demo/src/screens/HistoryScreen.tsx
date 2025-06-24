import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useHistory } from '../hooks/useHistory';
import { ScanResult } from '../types';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { history, clearHistory, getHistoryCount, getRemainingScans } = useHistory();

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
          }
        },
      ]
    );
  };

  const handleItemPress = (scanId: string) => {
    navigation.navigate('ScanResult', { scanId });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderHistoryItem = ({ item }: { item: ScanResult }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleItemPress(item.id)}
    >
      <Image 
        source={{ uri: item.imageUrl }}
        style={styles.thumbnail}
      />
      
      <View style={styles.itemContent}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>
        
        <View style={styles.safetyRow}>
          <Text style={[
            styles.safetyStatus,
            { color: item.isSafe ? '#10b981' : '#ef4444' }
          ]}>
            {item.isSafe ? '✅ Safe' : '⚠️ Contains allergens'}
          </Text>
          <Text style={styles.timestamp}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        
        {item.detectedAllergens.length > 0 && (
          <Text style={styles.allergens} numberOfLines={1}>
            Detected: {item.detectedAllergens.map(a => a.name).join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No scans yet</Text>
      <Text style={styles.emptySubtitle}>
        Start scanning food products to build your history
      </Text>
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.scanButtonText}>Start Scanning</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with scan counter */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Scan History</Text>
          <Text style={styles.counter}>
            {getHistoryCount()}/100 scans • {getRemainingScans()} remaining
          </Text>
        </View>
        
        {history.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* History list */}
      {history.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  counter: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  safetyStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  allergens: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  scanButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HistoryScreen;