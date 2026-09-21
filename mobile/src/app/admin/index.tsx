import { useState } from 'react';
import { ScrollView } from 'react-native';
import { ScreenHeader, Screen } from '../../components/ui';
import { AdminGate } from '../../components/admin/AdminGate';
import { AdminDashboard } from '../../components/admin/AdminDashboard';

export default function AdminScreen() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <Screen>
      <ScreenHeader title="Admin" />
      {unlocked ? (
        <ScrollView keyboardShouldPersistTaps="handled">
          <AdminDashboard />
        </ScrollView>
      ) : (
        <AdminGate onUnlocked={() => setUnlocked(true)} />
      )}
    </Screen>
  );
}
