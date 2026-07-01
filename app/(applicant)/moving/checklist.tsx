import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { fetchChecklist, toggleChecklistItem } from '@/lib/db';
import { MovingChecklistItem, MovingPhase } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const phaseConfig: Record<MovingPhase, { label: string; icon: string }> = {
  before_move: { label: 'Before you move', icon: 'calendar-outline' },
  move_day: { label: 'Moving day', icon: 'cube-outline' },
  first_week: { label: 'First week', icon: 'time-outline' },
  first_month: { label: 'First month', icon: 'checkmark-done-outline' },
};

const phaseOrder: MovingPhase[] = ['before_move', 'move_day', 'first_week', 'first_month'];

function ChecklistItem({ item, onToggle }: { item: MovingChecklistItem; onToggle: (id: string) => void }) {
  return (
    <Pressable onPress={() => onToggle(item.id)} style={styles.itemRow}>
      <View style={[styles.checkbox, item.completed ? styles.checkboxDone : {}]}>
        {item.completed && <Ionicons color={Colors.text.inverse} name="checkmark" size={14} />}
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, item.completed ? styles.itemDone : {}]}>{item.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <Text style={[styles.itemDescription, item.completed ? styles.itemDescDone : {}]}>{item.description}</Text>
        {item.actionUrl && !item.completed && (
          <Pressable onPress={() => Linking.openURL(item.actionUrl!)} style={styles.actionLink}>
            <Text style={styles.actionLinkText}>Open gov.uk</Text>
            <Ionicons color={Colors.accent.gold} name="open-outline" size={14} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default function ChecklistScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<MovingChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchChecklist(user.id).then((cl) => {
      setItems(cl);
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

  const toggle = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newCompleted = !item.completed;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: newCompleted } : i)));
    await toggleChecklistItem(id, newCompleted);
  };

  const completed = items.filter((i) => i.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Moving Checklist</Text>
          <Text style={styles.subtitle}>Every admin task for your move, in the right order.</Text>
        </View>

        <Card style={styles.progressCard}>
          <ProgressBar current={completed} label={`${completed} of ${items.length} tasks complete`} total={items.length} />
          {completed === items.length && items.length > 0 && (
            <View style={styles.completeRow}>
              <Ionicons color={Colors.success} name="checkmark-circle" size={18} />
              <Text style={styles.completeText}>All done — you&apos;re fully settled in.</Text>
            </View>
          )}
        </Card>

        {phaseOrder.map((phase) => {
          const phaseItems = items.filter((i) => i.duePhase === phase);
          if (phaseItems.length === 0) return null;
          const phaseDone = phaseItems.filter((i) => i.completed).length;
          const config = phaseConfig[phase];

          return (
            <View key={phase}>
              <View style={styles.phaseHeader}>
                <Ionicons
                  color={phaseDone === phaseItems.length ? Colors.success : Colors.text.muted}
                  name={config.icon as any}
                  size={16}
                />
                <Text style={styles.phaseLabel}>{config.label}</Text>
                <Text style={styles.phaseCount}>{phaseDone}/{phaseItems.length}</Text>
              </View>
              <Card style={styles.phaseCard}>
                {phaseItems.map((item, idx, arr) => (
                  <View key={item.id}>
                    <ChecklistItem item={item} onToggle={toggle} />
                    {idx < arr.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </Card>
            </View>
          );
        })}
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
  progressCard: { gap: Spacing.md },
  completeRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  completeText: { color: Colors.success, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  phaseHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  phaseLabel: { color: Colors.text.secondary, flex: 1, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  phaseCount: { color: Colors.text.muted, fontSize: Typography.sizes.sm },
  phaseCard: { gap: 0, paddingHorizontal: 0, paddingVertical: 0 },
  itemRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  checkbox: {
    alignItems: 'center',
    borderColor: Colors.border.default,
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    marginTop: 2,
    width: 22,
  },
  checkboxDone: { backgroundColor: Colors.accent.gold, borderColor: Colors.accent.gold },
  itemContent: { flex: 1, gap: Spacing.xs },
  itemHeader: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  itemTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  itemDone: { color: Colors.text.muted, textDecorationLine: 'line-through' },
  categoryBadge: { backgroundColor: Colors.background.tertiary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  categoryText: { color: Colors.text.muted, fontSize: Typography.sizes.xs },
  itemDescription: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  itemDescDone: { color: Colors.text.muted },
  actionLink: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  actionLinkText: { color: Colors.accent.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  divider: { backgroundColor: Colors.border.subtle, height: 1 },
});
