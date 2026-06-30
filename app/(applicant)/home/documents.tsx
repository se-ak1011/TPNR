import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';

type Document = {
  id: string;
  name: string;
  category: string;
  date: string;
  icon: string;
  color: string;
};

const mockDocuments: Document[] = [
  { id: 'd-001', name: 'Assured Shorthold Tenancy Agreement', category: 'Tenancy', date: '1 Sep 2024', icon: 'document-text', color: Colors.accent.gold },
  { id: 'd-002', name: 'Move-In Inventory Report', category: 'Inventory', date: '1 Sep 2024', icon: 'camera', color: Colors.accent.olive },
  { id: 'd-003', name: 'Deposit Protection Certificate (DPS)', category: 'Deposit', date: '20 Aug 2024', icon: 'wallet', color: '#4A90D9' },
  { id: 'd-004', name: 'How to Rent Guide', category: 'Rights', date: '1 Sep 2024', icon: 'book', color: Colors.text.muted },
  { id: 'd-005', name: 'Email: Boiler engineer visit confirmed', category: 'Correspondence', date: '11 Mar 2025', icon: 'mail', color: Colors.text.secondary },
];

const categories = [...new Set(mockDocuments.map((d) => d.category))];

export default function DocumentsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Documents</Text>
          <Text style={styles.subtitle}>Keep all your tenancy paperwork in one place.</Text>
        </View>

        <Button icon="cloud-upload-outline" title="Upload document" onPress={() => {}} variant="secondary" />

        {categories.map((cat) => (
          <View key={cat}>
            <Text style={styles.groupLabel}>{cat}</Text>
            <Card style={styles.groupCard}>
              {mockDocuments
                .filter((d) => d.category === cat)
                .map((doc, idx, arr) => (
                  <View key={doc.id}>
                    <View style={styles.docRow}>
                      <View style={[styles.docIcon, { borderColor: doc.color }]}>
                        <Ionicons color={doc.color} name={doc.icon as any} size={18} />
                      </View>
                      <View style={styles.docMeta}>
                        <Text style={styles.docName}>{doc.name}</Text>
                        <Text style={styles.docDate}>{doc.date}</Text>
                      </View>
                      <Ionicons color={Colors.text.muted} name="chevron-forward" size={16} />
                    </View>
                    {idx < arr.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
            </Card>
          </View>
        ))}

        <Card style={styles.tipCard} tone="muted">
          <View style={styles.tipRow}>
            <Ionicons color={Colors.accent.gold} name="shield-checkmark-outline" size={18} />
            <Text style={styles.tipTitle}>What to keep</Text>
          </View>
          {[
            'Tenancy agreement — your legal contract',
            'Deposit certificate — proof it\'s protected',
            'Move-in inventory — your deposit defence',
            'All correspondence with landlord / agent',
            'Any receipts for repairs you paid yourself',
          ].map((item) => (
            <View key={item} style={styles.listRow}>
              <Text style={styles.bullet}>·</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
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
  groupCard: { gap: 0, paddingHorizontal: 0, paddingVertical: 0 },
  docRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  docIcon: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  docMeta: { flex: 1, gap: 3 },
  docName: { color: Colors.text.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  docDate: { color: Colors.text.muted, fontSize: Typography.sizes.xs },
  divider: { backgroundColor: Colors.border.subtle, height: 1 },
  tipCard: { gap: Spacing.sm },
  tipRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  tipTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  listRow: { flexDirection: 'row', gap: Spacing.sm, paddingLeft: Spacing.xs },
  bullet: { color: Colors.text.muted, fontSize: Typography.sizes.sm },
  listText: { color: Colors.text.secondary, flex: 1, fontSize: Typography.sizes.sm, lineHeight: 20 },
});
