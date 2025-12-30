import React, { ReactNode, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRevenueCat } from '@/context/RevenueCatContext';
import { Paywall } from './Paywall';
import { colors } from '@/utils/colors';
import { Lock, Crown } from 'lucide-react-native';

interface ProFeatureGateProps {
  children: ReactNode;
  featureName?: string;
  showUpgradeButton?: boolean;
}

/**
 * Component that gates Pro features behind subscription check
 * 
 * Usage:
 * ```tsx
 * <ProFeatureGate featureName="Análisis Avanzado">
 *   <AdvancedAnalytics />
 * </ProFeatureGate>
 * ```
 */
export function ProFeatureGate({ 
  children, 
  featureName = 'esta función',
  showUpgradeButton = true 
}: ProFeatureGateProps) {
  const { isPro, isLoading } = useRevenueCat();
  const [showPaywall, setShowPaywall] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <>
      <View style={styles.lockedContainer}>
        <View style={styles.iconContainer}>
          <Lock size={32} color={colors.textMuted} />
        </View>
        <Text style={styles.title}>Función Pro</Text>
        <Text style={styles.description}>
          {featureName} está disponible solo para usuarios de Lunaria Pro
        </Text>
        {showUpgradeButton && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => setShowPaywall(true)}
          >
            <Crown size={20} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>Actualizar a Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseComplete={() => {
          setShowPaywall(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.moonWhite,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lavender,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
  },
});

