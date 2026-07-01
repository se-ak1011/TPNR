import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentTenancy } from '@/data/mockData';
import { ContactRole, PropertyContact } from '@/types';

const roleConfig: Record<ContactRole, { label: string; color: string; icon: string }> = {
  landlord: { label: 'Landlord', color: Colors.accent.gold, icon: 'home-outline' },
  agent: { label: 'Agent', color: Colors.accent.olive, icon: 'briefcase-outline' },
  emergency: { label: 'Emergency', color: Colors.error, icon: 'warning-outline' },
  utility: { label: 'Utility', color: '#4A90D9', icon: 'flash-outline' },
  other: { label: 'Other', color: Colors.text.muted, icon: 'ellipsis-horizontal-outline' },
};

const roleOrder: ContactRole[] = ['landlord', 'agent', 'emergency', 'utility', 'other'];

function ContactCard({ contact }: { contact: PropertyContact }) {
  const config = roleConfig[contact.role];

  return (
    <Card style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={[styles.roleIcon, { borderColor: config.color }]}>
          <Ionicons color={config.color} name={config.icon as any} size={18} />
        </View>
        <View style={styles.contactMeta}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <View style={[styles.roleBadge, { borderColor: config.color }]}>
            <Text style={[styles.roleLabel, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
      </View>

      {contact.notes && <Text style={styles.contactNotes}>{contact.notes}</Text>}

      <View style={styles.actionRow}>
        {contact.phone && (
          <Pressable onPress={() => Linking.openURL(`tel:${contact.phone}`)} style={styles.actionBtn}>
            <Ionicons color={Colors.accent.gold} name="call-outline" size={18} />
            <Text style={styles.actionLabel}>{contact.phone}</Text>
          </Pressable>
        )}
        {contact.email && (
          <Pressable onPress={() => Linking.openURL(`mailto:${contact.email}`)} style={styles.actionBtn}>
            <Ionicons color={Colors.text.secondary} name="mail-outline" size={18} />
            <Text style={styles.actionLabel} numberOfLines={1}>{contact.email}</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

export default function ContactsScreen() {
  const { contacts } = currentTenancy;
  const grouped = roleOrder.map((role) => ({
    role,
    items: contacts.filter((c) => c.role === role),
  })).filter((g) => g.items.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>Everyone you might need to reach about your home.</Text>
        </View>

        {grouped.map((group) => (
          <View key={group.role}>
            <Text style={styles.groupLabel}>{roleConfig[group.role].label}</Text>
            {group.items.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </View>
        ))}

        <Card style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons color={Colors.error} name="warning-outline" size={18} />
            <Text style={styles.emergencyTitle}>If it&apos;s an emergency</Text>
          </View>
          <Text style={styles.emergencyText}>
            Gas leak: call National Gas Emergency on 0800 111 999 immediately and leave the property.{'\n\n'}
            Electrical fire: call 999. Do not attempt to switch off at the fuse box.{'\n\n'}
            Your landlord is legally required to fix emergency repairs within 24 hours.
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
  groupLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  contactCard: { gap: Spacing.md },
  contactHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  roleIcon: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  contactMeta: { flex: 1, gap: 6 },
  contactName: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  roleBadge: { alignSelf: 'flex-start', borderRadius: 6, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  roleLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  contactNotes: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  actionRow: { gap: Spacing.sm },
  actionBtn: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  actionLabel: { color: Colors.text.secondary, flex: 1, fontSize: Typography.sizes.sm },
  emergencyCard: { borderColor: Colors.error, borderWidth: 1, gap: Spacing.md },
  emergencyHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  emergencyTitle: { color: Colors.error, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  emergencyText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
});
