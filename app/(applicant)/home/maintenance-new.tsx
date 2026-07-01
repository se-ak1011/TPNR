import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth';
import { createMaintenanceRequest } from '@/lib/db';
import { MaintenanceCategory, MaintenancePriority } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

type CategoryOption = { id: MaintenanceCategory; label: string; icon: string };
type PriorityOption = { id: MaintenancePriority; label: string; color: string };

const categories: CategoryOption[] = [
  { id: 'heating', label: 'Heating', icon: 'flame-outline' },
  { id: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
  { id: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { id: 'damp_mould', label: 'Damp / Mould', icon: 'rainy-outline' },
  { id: 'appliance', label: 'Appliance', icon: 'hardware-chip-outline' },
  { id: 'structural', label: 'Structural', icon: 'business-outline' },
  { id: 'other', label: 'Other', icon: 'build-outline' },
];

const priorities: PriorityOption[] = [
  { id: 'low', label: 'Low', color: Colors.text.muted },
  { id: 'medium', label: 'Medium', color: Colors.accent.gold },
  { id: 'high', label: 'High', color: Colors.error },
  { id: 'emergency', label: 'Emergency', color: Colors.error },
];

export default function MaintenanceNewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory | null>(null);
  const [priority, setPriority] = useState<MaintenancePriority | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = title.trim() && description.trim() && category && priority;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    await createMaintenanceRequest(user!.id, {
      title: title.trim(),
      description: description.trim(),
      category: category!,
      priority: priority!,
    });
    setSaving(false);
    Alert.alert('Logged', 'Your maintenance request has been saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Log an Issue</Text>
        <Text style={styles.subtitle}>
          This creates a timestamped record. If your landlord ignores it, this is your evidence.
        </Text>

        <Card style={styles.card}>
          <Input label="Title" onChangeText={setTitle} placeholder="e.g. Boiler not working" value={title} />
        </Card>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {categories.map((cat) => {
              const selected = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[styles.chip, selected ? styles.chipSelected : {}]}>
                  <Ionicons
                    color={selected ? Colors.text.inverse : Colors.text.secondary}
                    name={cat.icon as any}
                    size={16}
                  />
                  <Text style={[styles.chipText, selected ? styles.chipTextSelected : {}]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Priority</Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => {
              const selected = priority === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPriority(p.id)}
                  style={[styles.priorityChip, selected ? { borderColor: p.color, backgroundColor: `${p.color}20` } : {}]}>
                  <Text style={[styles.priorityText, selected ? { color: p.color } : {}]}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={styles.card}>
          <Input
            label="Description"
            multiline
            onChangeText={setDescription}
            placeholder="Describe the issue — when it started, how bad it is, what you've already tried..."
            value={description}
          />
        </Card>

        <Card style={styles.photoPlaceholder}>
          <Ionicons color={Colors.text.muted} name="camera-outline" size={28} />
          <Text style={styles.photoLabel}>Add photos</Text>
          <Text style={styles.photoSub}>Photo evidence makes disputes much harder to ignore</Text>
        </Card>

        <Button disabled={!canSubmit || saving} title={saving ? 'Saving…' : 'Save request'} onPress={handleSubmit} />
        <Button title="Cancel" onPress={() => router.back()} variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  card: {},
  group: { gap: Spacing.sm },
  groupLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    alignItems: 'center',
    borderColor: Colors.border.default,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipSelected: { backgroundColor: Colors.accent.gold, borderColor: Colors.accent.gold },
  chipText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  chipTextSelected: { color: Colors.text.inverse, fontWeight: Typography.weights.semibold },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm },
  priorityChip: {
    alignItems: 'center',
    borderColor: Colors.border.default,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  priorityText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  photoPlaceholder: {
    alignItems: 'center',
    borderStyle: 'dashed',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  photoLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  photoSub: { color: Colors.text.muted, fontSize: Typography.sizes.sm, textAlign: 'center' },
});
