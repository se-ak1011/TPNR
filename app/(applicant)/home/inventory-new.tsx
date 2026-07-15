import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth';
import { createInventoryItem } from '@/lib/db';
import { ConditionRating } from '@/types';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

type ConditionOption = { id: ConditionRating; label: string; color: string };

const CONDITION_OPTIONS: ConditionOption[] = [
  { id: 'excellent', label: 'Excellent', color: Colors.success },
  { id: 'good', label: 'Good', color: Colors.accent.olive },
  { id: 'fair', label: 'Fair', color: Colors.accent.gold },
  { id: 'poor', label: 'Poor', color: Colors.error },
];

export default function InventoryNewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState('');
  const [item, setItem] = useState('');
  const [condition, setCondition] = useState<ConditionRating | null>(null);
  const [notes, setNotes] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSubmit = room.trim() && item.trim() && condition;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    await createInventoryItem(user!.id, {
      room: room.trim(),
      item: item.trim(),
      condition: condition!,
      notes: notes.trim() || undefined,
      photoTaken,
    });
    setSaving(false);
    Alert.alert('Saved', 'Inventory item added.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons color={Colors.text.secondary} name="arrow-back" size={20} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Add Item</Text>
          <Text style={styles.subtitle}>
            Document the condition at move-in. This is your evidence if the landlord makes unfair deductions.
          </Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Room"
            onChangeText={setRoom}
            placeholder="e.g. Living room, Kitchen, Master bedroom"
            value={room}
          />
          <Input
            label="Item"
            onChangeText={setItem}
            placeholder="e.g. Sofa, Oven, Wardrobe"
            value={item}
          />
        </Card>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Condition at move-in</Text>
          <View style={styles.conditionRow}>
            {CONDITION_OPTIONS.map((opt) => {
              const selected = condition === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setCondition(opt.id)}
                  style={[
                    styles.conditionChip,
                    selected ? { borderColor: opt.color, backgroundColor: `${opt.color}20` } : {},
                  ]}>
                  <Text style={[styles.conditionText, selected ? { color: opt.color } : {}]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={styles.card}>
          <Input
            label="Notes"
            multiline
            onChangeText={setNotes}
            placeholder="Describe any damage, marks, or defects visible now"
            value={notes}
          />
        </Card>

        <Pressable onPress={() => setPhotoTaken((p) => !p)}>
          <Card style={[styles.photoCard, photoTaken && styles.photoCardActive]} tone={photoTaken ? undefined : 'muted'}>
            <Ionicons
              color={photoTaken ? Colors.success : Colors.text.muted}
              name={photoTaken ? 'camera' : 'camera-outline'}
              size={22}
            />
            <View style={styles.photoMeta}>
              <Text style={[styles.photoLabel, photoTaken && styles.photoLabelActive]}>
                {photoTaken ? 'Photo marked as taken' : 'Mark photo as taken'}
              </Text>
              <Text style={styles.photoSub}>Keep it in your camera roll — we can't store files yet</Text>
            </View>
            <Ionicons
              color={photoTaken ? Colors.success : Colors.text.muted}
              name={photoTaken ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
            />
          </Card>
        </Pressable>

        <Button disabled={!canSubmit || saving} title={saving ? 'Saving…' : 'Save item'} onPress={handleSave} />
        <Button title="Cancel" onPress={() => router.back()} variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { gap: Spacing.sm },
  backBtn: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 6, marginBottom: 4 },
  backText: { color: Colors.text.secondary, fontSize: Typography.sizes.md },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  card: { gap: Spacing.lg },
  group: { gap: Spacing.sm },
  groupLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  conditionRow: { flexDirection: 'row', gap: Spacing.sm },
  conditionChip: {
    alignItems: 'center',
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  conditionText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  photoCard: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  photoCardActive: { borderColor: Colors.success },
  photoMeta: { flex: 1, gap: 3 },
  photoLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium },
  photoLabelActive: { color: Colors.success },
  photoSub: { color: Colors.text.muted, fontSize: Typography.sizes.xs, lineHeight: 16 },
});
