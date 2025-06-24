import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useAllergens } from '../hooks/useAllergens';
import { Allergen, AllergenGroup } from '../types';

const AllergensScreen = () => {
  const {
    allergens,
    updateAllergen,
    addCustomAllergen,
    removeCustomAllergen,
    getSelectedAllergens,
    getAllergensByCategory,
  } = useAllergens();

  const [customAllergenInput, setCustomAllergenInput] = useState('');

  const handleToggleAllergen = async (id: string, currentState: boolean) => {
    await updateAllergen(id, !currentState);
  };

  const handleAddCustomAllergen = async () => {
    const trimmedInput = customAllergenInput.trim();
    if (trimmedInput) {
      await addCustomAllergen(trimmedInput);
      setCustomAllergenInput('');
    }
  };

  const handleRemoveCustomAllergen = (allergen: Allergen) => {
    Alert.alert(
      'Remove Custom Allergen',
      `Remove "${allergen.name}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeCustomAllergen(allergen.id)
        },
      ]
    );
  };

  const getAllergenGroups = (): AllergenGroup[] => {
    const groups: AllergenGroup[] = [];

    const commonAllergensData = getAllergensByCategory('common');
    if (commonAllergensData.length > 0) {
      groups.push({
        category: 'common',
        title: 'Common Allergens',
        allergens: commonAllergensData,
      });
    }

    const dietaryData = getAllergensByCategory('dietary');
    if (dietaryData.length > 0) {
      groups.push({
        category: 'dietary',
        title: 'Dietary Restrictions',
        allergens: dietaryData,
      });
    }

    const religiousData = getAllergensByCategory('religious');
    if (religiousData.length > 0) {
      groups.push({
        category: 'religious',
        title: 'Religious & Ethical',
        allergens: religiousData,
      });
    }

    const customData = getAllergensByCategory('custom');
    if (customData.length > 0) {
      groups.push({
        category: 'custom',
        title: 'Custom Restrictions',
        allergens: customData,
      });
    }

    return groups;
  };

  const renderAllergenItem = (allergen: Allergen) => (
    <TouchableOpacity
      key={allergen.id}
      style={[
        styles.allergenItem,
        allergen.selected && styles.allergenItemSelected
      ]}
      onPress={() => handleToggleAllergen(allergen.id, allergen.selected)}
      onLongPress={() => {
        if (allergen.category === 'custom') {
          handleRemoveCustomAllergen(allergen);
        }
      }}
    >
      <Text style={[
        styles.allergenText,
        allergen.selected && styles.allergenTextSelected
      ]}>
        {allergen.name}
      </Text>
      {allergen.selected && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderAllergenGroup = (group: AllergenGroup) => (
    <View key={group.category} style={styles.group}>
      <Text style={styles.groupTitle}>{group.title}</Text>
      <View style={styles.allergensGrid}>
        {group.allergens.map(renderAllergenItem)}
      </View>
      {group.category === 'custom' && (
        <Text style={styles.customHint}>
          Long press custom allergens to remove them
        </Text>
      )}
    </View>
  );

  const selectedCount = getSelectedAllergens().length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Allergens</Text>
        <Text style={styles.subtitle}>
          {selectedCount} selected • Tap to add/remove
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom allergen input */}
        <View style={styles.customInputSection}>
          <Text style={styles.customInputLabel}>Add Custom Restriction</Text>
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="e.g., Artificial colors, MSG..."
              value={customAllergenInput}
              onChangeText={setCustomAllergenInput}
              onSubmitEditing={handleAddCustomAllergen}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !customAllergenInput.trim() && styles.addButtonDisabled
              ]}
              onPress={handleAddCustomAllergen}
              disabled={!customAllergenInput.trim()}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Allergen groups */}
        {getAllergenGroups().map(renderAllergenGroup)}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  customInputSection: {
    marginBottom: 32,
  },
  customInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#7C3AED',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  group: {
    marginBottom: 32,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  allergensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  allergenItemSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#5b21b6',
  },
  allergenText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  allergenTextSelected: {
    color: 'white',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  customHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AllergensScreen;