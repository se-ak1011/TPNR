import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import { fetchContacts } from '@/lib/db';
import { ContactRole, PropertyContact } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

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
      {contact.notes ? <Text style={styles.contactNotes}>{contact.notes}</Text> : null}
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
  const { user } = useAuth();
  const [contacts, setContacts] = useState<PropertyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchContacts(user.id).then((c) => {
      setContacts(c);
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

  const grouped = roleOrder
    .map((role) => ({ role, items: contacts.filter((c) => c.role === role) }))
    .filter((g) => g.items.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>Everyone you might need to reach about your home.</Text>
        </View>

        {grouped.length === 0 ? (
          <Card style={styles.emptyCard} tone="muted">
            <Ionicons color={Colors.text.muted} name="call-outline" size={28} />
            <Text style={styles.emptyText}>No contacts added yet. Contacts are set up when your tenancy is configured.</Text>
          </Card>
        ) : (
          grouped.map((group) => (
            <View key={group.role}>
              <Text style={styles.groupLabel}>{roleConfig[group.role].label}</Text>
              {group.items.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </View>
          ))
        )}

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
  emptyCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  emptyText: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22, textAlign: 'center' },
  contactCard: { gap: Spacing.md },
  contactHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  roleIcon: { alignItems: 'center', borderRadius: 10, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
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
