import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import { fetchTenancy } from '@/lib/db';
import { ConditionRating, CurrentTenancy, InventoryItem } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const conditionConfig: Record<ConditionRating, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: Colors.success },
  good: { label: 'Good', color: Colors.accent.olive },
  fair: { label: 'Fair', color: Colors.accent.gold },
  poor: { label: 'Poor', color: Colors.error },
};

function InventoryRow({ item }: { item: InventoryItem }) {
  const config = conditionConfig[item.condition];
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.item}</Text>
        {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
      </View>
      <View style={styles.itemRight}>
        <View style={[styles.conditionBadge, { borderColor: config.color }]}>
          <Text style={[styles.conditionLabel, { color: config.color }]}>{config.label}</Text>
        </View>
        <Ionicons
          color={item.photoTaken ? Colors.success : Colors.text.muted}
          name={item.photoTaken ? 'camera' : 'camera-outline'}
          size={16}
        />
      </View>
    </View>
  );
}

export default function InventoryScreen() {
  const { user } = useAuth();
  const [tenancy, setTenancy] = useState<CurrentTenancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTenancy(user.id).then((t) => {
      setTenancy(t);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator color={Colors.accent.gold} />
      </View>
    );
  }

  const inventoryItems = tenancy?.inventoryItems ?? [];
  const rooms = [...new Set(inventoryItems.map((i) => i.room))];
  const totalPhotos = inventoryItems.filter((i) => i.photoTaken).length;
  const moveInDate = tenancy?.tenancyStartDate
    ? new Date(tenancy.tenancyStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Move-In Inventory</Text>
          {moveInDate ? <Text style={styles.subtitle}>Recorded {moveInDate}</Text> : null}
        </View>

        {inventoryItems.length === 0 ? (
          <Card style={styles.emptyCard} tone="muted">
            <Ionicons color={Colors.text.muted} name="camera-outline" size={28} />
            <Text style={styles.emptyText}>No inventory items recorded yet. Items are added when your tenancy is set up.</Text>
          </Card>
        ) : (
          <>
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{inventoryItems.length}</Text>
                  <Text style={styles.statLabel}>Items</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{rooms.length}</Text>
                  <Text style={styles.statLabel}>Rooms</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, totalPhotos < inventoryItems.length ? styles.warningValue : styles.okValue]}>
                    {totalPhotos}/{inventoryItems.length}
                  </Text>
                  <Text style={styles.statLabel}>Photos taken</Text>
                </View>
              </View>
              <Text style={styles.statsNote}>
                These photos protect your deposit. Keep them safe — you may need them at move-out.
              </Text>
            </Card>

            {rooms.map((room) => (
              <View key={room}>
                <Text style={styles.roomLabel}>{room}</Text>
                <Card style={styles.roomCard}>
                  {inventoryItems
                    .filter((i) => i.room === room)
                    .map((item, idx, arr) => (
                      <View key={item.id}>
                        <InventoryRow item={item} />
                        {idx < arr.length - 1 && <View style={styles.divider} />}
                      </View>
                    ))}
                </Card>
              </View>
            ))}
          </>
        )}

        <Card style={styles.tipCard} tone="muted">
          <View style={styles.tipHeader}>
            <Ionicons color={Colors.accent.gold} name="bulb-outline" size={18} />
            <Text style={styles.tipTitle}>Protect yourself at move-out</Text>
          </View>
          <Text style={styles.tipText}>
            When you leave, take the same photos in the same rooms. Any differences you can document as pre-existing are
            deductions your landlord cannot claim for.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { gap: Spacing.xs },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md },
  emptyCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  emptyText: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22, textAlign: 'center' },
  statsCard: { gap: Spacing.md },
  statsRow: { alignItems: 'center', flexDirection: 'row' },
  stat: { alignItems: 'center', flex: 1, gap: 4 },
  statValue: { color: Colors.text.primary, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  okValue: { color: Colors.success },
  warningValue: { color: Colors.accent.gold },
  statLabel: { color: Colors.text.muted, fontSize: Typography.sizes.xs },
  statDivider: { backgroundColor: Colors.border.default, height: 32, width: 1 },
  statsNote: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  roomLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  roomCard: { gap: 0, paddingHorizontal: 0, paddingVertical: 0 },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  itemLeft: { flex: 1, gap: 3 },
  itemName: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium },
  itemNotes: { color: Colors.text.secondary, fontSize: Typography.sizes.xs, lineHeight: 18 },
  itemRight: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  conditionBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  conditionLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  divider: { backgroundColor: Colors.border.subtle, height: 1 },
  tipCard: { gap: Spacing.sm },
  tipHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  tipTitle: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  tipText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
});
