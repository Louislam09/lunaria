import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { CustomerCenterView } from 'react-native-purchases-ui';
import { useRevenueCat } from '@/context/RevenueCatContext';
import { colors } from '@/utils/colors';
import { X } from 'lucide-react-native';

interface CustomerCenterProps {
  visible: boolean;
  onClose: () => void;
}

export function CustomerCenter({ visible, onClose }: CustomerCenterProps) {
  const { customerInfo, restoreSubscription, isLoading } = useRevenueCat();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      const success = await restoreSubscription();
      
      if (success) {
        Alert.alert('Restaurado', 'Tus compras han sido restauradas correctamente');
      } else {
        Alert.alert('Sin compras', 'No se encontraron compras para restaurar');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al restaurar tus compras');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Centro de Suscripciones</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              disabled={isRestoring}
            >
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {isRestoring && (
            <View style={styles.restoringOverlay}>
              <ActivityIndicator size="large" color={colors.lavender} />
              <Text style={styles.restoringText}>Restaurando compras...</Text>
            </View>
          )}

          <ScrollView style={styles.content}>
            {customerInfo && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Información de Suscripción</Text>
                
                {customerInfo.entitlements.active['Lunaria Pro'] ? (
                  <View style={styles.activeSubscription}>
                    <Text style={styles.statusText}>Estado: Activa</Text>
                    <Text style={styles.statusSubtext}>
                      Tienes acceso a Lunaria Pro
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inactiveSubscription}>
                    <Text style={styles.statusText}>Estado: Inactiva</Text>
                    <Text style={styles.statusSubtext}>
                      No tienes una suscripción activa
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={isRestoring}
              >
                <Text style={styles.restoreButtonText}>
                  Restaurar Compras
                </Text>
              </TouchableOpacity>

              <Text style={styles.helpText}>
                Si has realizado compras anteriormente, puedes restaurarlas aquí.
              </Text>
            </View>

            {/* RevenueCat Customer Center View */}
            <View style={styles.customerCenterContainer}>
              <CustomerCenterView
                onError={(error) => {
                  console.error('Customer Center error:', error);
                  Alert.alert('Error', 'No se pudo cargar el centro de suscripciones');
                }}
                style={styles.customerCenterView}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.moonWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'DMSans_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 12,
  },
  activeSubscription: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
  },
  inactiveSubscription: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  actionsSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  restoreButton: {
    backgroundColor: colors.lavender,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  restoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
  },
  helpText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  customerCenterContainer: {
    paddingVertical: 20,
    minHeight: 200,
  },
  customerCenterView: {
    flex: 1,
  },
  restoringOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  restoringText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'DMSans_500Medium',
  },
});

