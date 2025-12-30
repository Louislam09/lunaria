import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { PaywallView } from 'react-native-purchases-ui';
import { useRevenueCat } from '@/context/RevenueCatContext';
import { colors } from '@/utils/colors';
import { X } from 'lucide-react-native';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
}

export function Paywall({ visible, onClose, onPurchaseComplete }: PaywallProps) {
  const { currentOffering, isLoading, error, clearError } = useRevenueCat();

  useEffect(() => {
    if (visible) {
      clearError();
    }
  }, [visible, clearError]);

  if (!currentOffering) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Lunaria Pro</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.lavender} />
                <Text style={styles.loadingText}>Cargando opciones...</Text>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  No hay ofertas disponibles en este momento.
                </Text>
                <Text style={styles.errorSubtext}>
                  Por favor, intenta más tarde.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

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
            <Text style={styles.title}>Lunaria Pro</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
            >
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PaywallView
            offering={currentOffering}
            onPurchaseCompleted={(customerInfo) => {
              onPurchaseComplete?.();
              onClose();
              Alert.alert('¡Éxito!', 'Tu suscripción a Lunaria Pro ha sido activada');
            }}
            onRestoreCompleted={(customerInfo) => {
              Alert.alert('Restaurado', 'Tus compras han sido restauradas');
            }}
            onError={(error) => {
              console.error('Paywall error:', error);
              Alert.alert('Error', 'Hubo un problema con la compra. Por favor, intenta de nuevo.');
            }}
            style={styles.paywall}
          />
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
  paywall: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
  },
  errorSubtext: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginTop: 8,
    textAlign: 'center',
  },
});

