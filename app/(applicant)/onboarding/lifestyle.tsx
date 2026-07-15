import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { fetchPassport, savePassportStep } from '@/lib/db';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const SMOKING_OPTIONS = [
  { id: 'non_smoker', label: 'Non-smoker' },
  { id: 'smoker', label: 'Smoker' },
  { id: 'outdoor_only', label: 'Outdoor only' },
] as const;

const RIGHT_TO_RENT_OPTIONS = [
  { id: 'uk_citizen', label: 'UK Citizen' },
  { id: 'eu_settled', label: 'EU Settled' },
  { id: 'visa', label: 'Visa holder' },
  { id: 'other', label: 'Other' },
] as const;

type SmokingStatus = typeof SMOKING_OPTIONS[number]['id'];
type RightToRent = typeof RIGHT_TO_RENT_OPTIONS[number]['id'];

export default function LifestyleOnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState('');
  const [hasChildren, setHasChildren] = useState(false);
  const [numberOfDependants, setNumberOfDependants] = useState('');
  const [smoking, setSmoking] = useState<SmokingStatus>('non_smoker');
  const [rightToRent, setRightToRent] = useState<RightToRent>('uk_citizen');
  const [rightToRentExpiry, setRightToRentExpiry] = useState('');
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorRelationship, setGuarantorRelationship] = useState('');
  const [hasReferences, setHasReferences] = useState(false);
  const [referenceDetails, setReferenceDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPassport(user.id).then((p) => {
      if (!p) return;
      setHasPets(p.hasPets ?? false);
      setPetDetails(p.petDetails ?? '');
      setHasChildren(p.hasChildren ?? false);
      setNumberOfDependants(p.numberOfDependants ? String(p.numberOfDependants) : '');
      if (p.smokingStatus) setSmoking(p.smokingStatus as SmokingStatus);
      if (p.rightToRent) setRightToRent(p.rightToRent as RightToRent);
      setRightToRentExpiry(p.rightToRentExpiry ?? '');
      setHasGuarantor(p.hasGuarantor ?? false);
      setGuarantorName(p.guarantorName ?? '');
      setGuarantorRelationship(p.guarantorRelationship ?? '');
      setHasReferences(p.hasReferences ?? false);
      setReferenceDetails(p.referenceDetails ?? '');
      setNotes(p.notesForAgent ?? '');
    });
  }, [user]);

  const handleContinue = async () => {
    setSaving(true);
    await savePassportStep(user!.id, {
      has_pets: hasPets,
      pet_details: hasPets ? petDetails.trim() || null : null,
      has_children: hasChildren,
      number_of_dependants: hasChildren ? parseInt(numberOfDependants, 10) || 0 : 0,
      smoking_status: smoking,
      right_to_rent: rightToRent,
      right_to_rent_expiry: rightToRent === 'visa' ? rightToRentExpiry.trim() || null : null,
      has_guarantor: hasGuarantor,
      guarantor_name: hasGuarantor ? guarantorName.trim() || null : null,
      guarantor_relationship: hasGuarantor ? guarantorRelationship.trim() || null : null,
      has_references: hasReferences,
      reference_details: hasReferences ? referenceDetails.trim() || null : null,
      notes_for_agent: notes.trim() || null,
    });
    setSaving(false);
    router.push('/(applicant)/onboarding/documents');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={3} label="Step 3 of 4" total={4} />
        <Text style={styles.title}>Lifestyle details</Text>

        <Card style={styles.formCard}>
          {/* Pets */}
          <View style={styles.group}>
            <Text style={styles.label}>Pets</Text>
            <View style={styles.toggleRow}>
              <Toggle label="No pets" selected={!hasPets} onPress={() => setHasPets(false)} />
              <Toggle label="Has pets" selected={hasPets} onPress={() => setHasPets(true)} />
            </View>
            {hasPets && (
              <Input
                label="What kind of pet(s)?"
                onChangeText={setPetDetails}
                placeholder="e.g. 1 cat, medium-sized dog"
                value={petDetails}
              />
            )}
          </View>

          {/* Children / dependants */}
          <View style={styles.group}>
            <Text style={styles.label}>Children / dependants</Text>
            <View style={styles.toggleRow}>
              <Toggle label="None" selected={!hasChildren} onPress={() => setHasChildren(false)} />
              <Toggle label="Yes" selected={hasChildren} onPress={() => setHasChildren(true)} />
            </View>
            {hasChildren && (
              <Input
                keyboardType="numeric"
                label="Number of dependants"
                maxLength={2}
                onChangeText={setNumberOfDependants}
                placeholder="e.g. 2"
                value={numberOfDependants}
              />
            )}
          </View>

          {/* Smoking */}
          <View style={styles.group}>
            <Text style={styles.label}>Smoking</Text>
            <View style={styles.toggleRow}>
              {SMOKING_OPTIONS.map((opt) => (
                <Toggle key={opt.id} label={opt.label} selected={smoking === opt.id} onPress={() => setSmoking(opt.id)} />
              ))}
            </View>
          </View>
        </Card>

        <Card style={styles.formCard}>
          {/* Right to Rent */}
          <View style={styles.group}>
            <Text style={styles.label}>Right to Rent</Text>
            <Text style={styles.hint}>Required by law. Landlords must check this before renting to you.</Text>
            <View style={styles.toggleRow}>
              {RIGHT_TO_RENT_OPTIONS.map((opt) => (
                <Toggle
                  key={opt.id}
                  label={opt.label}
                  selected={rightToRent === opt.id}
                  onPress={() => setRightToRent(opt.id)}
                />
              ))}
            </View>
            {rightToRent === 'visa' && (
              <Input
                label="Visa expiry date"
                onChangeText={setRightToRentExpiry}
                placeholder="e.g. 2026-09-30"
                value={rightToRentExpiry}
              />
            )}
          </View>
        </Card>

        <Card style={styles.formCard}>
          {/* Guarantor */}
          <View style={styles.group}>
            <Text style={styles.label}>Guarantor</Text>
            <View style={styles.toggleRow}>
              <Toggle label="Not needed" selected={!hasGuarantor} onPress={() => setHasGuarantor(false)} />
              <Toggle label="I have one" selected={hasGuarantor} onPress={() => setHasGuarantor(true)} />
            </View>
            {hasGuarantor && (
              <>
                <Input
                  label="Guarantor's full name"
                  onChangeText={setGuarantorName}
                  placeholder="Full name"
                  value={guarantorName}
                />
                <Input
                  label="Relationship to you"
                  onChangeText={setGuarantorRelationship}
                  placeholder="e.g. Parent, sibling, employer"
                  value={guarantorRelationship}
                />
              </>
            )}
          </View>

          {/* References */}
          <View style={styles.group}>
            <Text style={styles.label}>References</Text>
            <View style={styles.toggleRow}>
              <Toggle label="Not yet" selected={!hasReferences} onPress={() => setHasReferences(false)} />
              <Toggle label="Available" selected={hasReferences} onPress={() => setHasReferences(true)} />
            </View>
            {hasReferences && (
              <Input
                label="Reference details"
                multiline
                onChangeText={setReferenceDetails}
                placeholder="e.g. Previous landlord and employer reference ready to share"
                value={referenceDetails}
              />
            )}
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Input label="Notes for landlord or agent" multiline onChangeText={setNotes} value={notes} />
        </Card>

        <Button disabled={saving} title={saving ? 'Saving…' : 'Continue to documents'} onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Toggle({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggle, selected && styles.toggleSelected]}>
      <Text style={[styles.toggleText, selected && styles.toggleTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  formCard: { gap: Spacing.lg },
  group: { gap: Spacing.sm },
  label: { color: Colors.text.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  hint: { color: Colors.text.muted, fontSize: Typography.sizes.xs, lineHeight: 18 },
  toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  toggle: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  toggleSelected: { backgroundColor: `${Colors.accent.gold}22`, borderColor: Colors.accent.gold },
  toggleText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  toggleTextSelected: { color: Colors.text.primary },
});
