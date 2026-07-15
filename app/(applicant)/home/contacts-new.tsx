import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth';
import { createContact } from '@/lib/db';
import { ContactRole } from '@/types';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

type RoleOption = { id: ContactRole; label: string; icon: string };

const ROLE_OPTIONS: RoleOption[] = [
  { id: 'landlord', label: 'Landlord', icon: 'home-outline' },
  { id: 'agent', label: 'Agent', icon: 'briefcase-outline' },
  { id: 'emergency', label: 'Emergency', icon: 'warning-outline' },
  { id: 'utility', label: 'Utility', icon: 'flash-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function ContactsNewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<ContactRole | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const canSubmit = name.trim() && role;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    await createContact(user!.id, {
      name: name.trim(),
      role: role!,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSaving(false);
    Alert.alert('Saved', 'Contact added.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons color={Colors.text.secondary} name="arrow-back" size={20} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Add Contact</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Name"
            onChangeText={setName}
            placeholder="Full name or company name"
            value={name}
          />
        </Card>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Role</Text>
          <View style={styles.chipRow}>
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setRole(opt.id)}
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Ionicons
                    color={selected ? Colors.text.inverse : Colors.text.secondary}
                    name={opt.icon as any}
                    size={14}
                  />
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={styles.card}>
          <Input
            label="Phone number"
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder="e.g. 07700 900123"
            value={phone}
          />
          <Input
            label="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            placeholder="e.g. landlord@example.com"
            value={email}
          />
          <Input
            label="Notes"
            multiline
            onChangeText={setNotes}
            placeholder="Anything useful — best time to call, what they handle, etc."
            value={notes}
          />
        </Card>

        <Button disabled={!canSubmit || saving} title={saving ? 'Saving…' : 'Save contact'} onPress={handleSave} />
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
  card: { gap: Spacing.lg },
  group: { gap: Spacing.sm },
  groupLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    alignItems: 'center',
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  chipSelected: { backgroundColor: Colors.accent.gold, borderColor: Colors.accent.gold },
  chipText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  chipTextSelected: { color: Colors.text.inverse, fontWeight: Typography.weights.semibold },
});
