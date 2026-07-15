import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth';
import { fetchTenancy, upsertTenancy } from '@/lib/db';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const SCHEME_OPTIONS = [
  { id: 'DPS', label: 'DPS' },
  { id: 'TDS', label: 'TDS' },
  { id: 'MyDeposits', label: 'MyDeposits' },
] as const;

type Scheme = typeof SCHEME_OPTIONS[number]['id'];

function Chip({
  label, selected, onPress,
}: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function TenancySetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [propertyAddress, setPropertyAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositScheme, setDepositScheme] = useState<Scheme>('DPS');
  const [depositSchemeRef, setDepositSchemeRef] = useState('');
  const [depositPaidAt, setDepositPaidAt] = useState('');
  const [landlordName, setLandlordName] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchTenancy(user.id).then((t) => {
      if (t) {
        setPropertyAddress(t.propertyAddress ?? '');
        setStartDate(t.tenancyStartDate ?? '');
        setEndDate(t.tenancyEndDate ?? '');
        setMonthlyRent(t.monthlyRent ? String(t.monthlyRent) : '');
        setDepositAmount(t.depositInfo?.amount ? String(t.depositInfo.amount) : '');
        if (t.depositInfo?.scheme) setDepositScheme(t.depositInfo.scheme as Scheme);
        setDepositSchemeRef(t.depositInfo?.schemeRef ?? '');
        setDepositPaidAt(t.depositInfo?.paidAt ?? '');
        setLandlordName(t.depositInfo?.landlordName ?? '');
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!propertyAddress.trim()) {
      Alert.alert('Required', 'Please enter the property address.');
      return;
    }
    setSaving(true);
    await upsertTenancy(user!.id, {
      propertyAddress: propertyAddress.trim(),
      tenancyStartDate: startDate.trim() || undefined,
      tenancyEndDate: endDate.trim() || undefined,
      monthlyRent: parseInt(monthlyRent, 10) || undefined,
      depositAmount: parseInt(depositAmount, 10) || undefined,
      depositScheme: depositScheme,
      depositSchemeRef: depositSchemeRef.trim() || undefined,
      depositPaidAt: depositPaidAt.trim() || undefined,
      depositLandlordName: landlordName.trim() || undefined,
    });
    setSaving(false);
    Alert.alert('Saved', 'Your tenancy details have been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator color={Colors.accent.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons color={Colors.text.secondary} name="arrow-back" size={20} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Set Up Tenancy</Text>
          <Text style={styles.subtitle}>
            Enter your property details. These power your deposit tracker, maintenance log, and contacts.
          </Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Property address"
            onChangeText={setPropertyAddress}
            placeholder="Full address including postcode"
            value={propertyAddress}
          />
          <Input
            label="Tenancy start date"
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            value={startDate}
          />
          <Input
            label="Tenancy end date"
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            value={endDate}
          />
          <Input
            keyboardType="numeric"
            label="Monthly rent (£)"
            onChangeText={setMonthlyRent}
            placeholder="e.g. 1500"
            value={monthlyRent}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Deposit</Text>
          <Input
            keyboardType="numeric"
            label="Deposit amount (£)"
            onChangeText={setDepositAmount}
            placeholder="e.g. 2000"
            value={depositAmount}
          />

          <View style={styles.group}>
            <Text style={styles.groupLabel}>Protection scheme</Text>
            <View style={styles.chipRow}>
              {SCHEME_OPTIONS.map((s) => (
                <Chip
                  key={s.id}
                  label={s.label}
                  selected={depositScheme === s.id}
                  onPress={() => setDepositScheme(s.id)}
                />
              ))}
            </View>
          </View>

          <Input
            label="Scheme reference number"
            onChangeText={setDepositSchemeRef}
            placeholder="e.g. DPS123456"
            value={depositSchemeRef}
          />
          <Input
            label="Deposit paid date"
            onChangeText={setDepositPaidAt}
            placeholder="YYYY-MM-DD"
            value={depositPaidAt}
          />
          <Input
            label="Landlord / agency name"
            onChangeText={setLandlordName}
            placeholder="Who holds the deposit"
            value={landlordName}
          />
        </Card>

        <Button disabled={saving} title={saving ? 'Saving…' : 'Save tenancy details'} onPress={handleSave} />
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
  sectionTitle: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  group: { gap: Spacing.sm },
  groupLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  chipRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  chipSelected: { backgroundColor: `${Colors.accent.gold}22`, borderColor: Colors.accent.gold },
  chipText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  chipTextSelected: { color: Colors.text.primary },
});
