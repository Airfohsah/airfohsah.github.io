import { useState } from 'react';
import { ScrollView } from 'react-native';
import { IllustratedScreen, IllustratedHeader } from '../../components/illustrated';
import { AdminGate } from '../../components/admin/AdminGate';
import { AdminDashboard } from '../../components/admin/AdminDashboard';

export default function AdminScreen() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <IllustratedScreen>
      <IllustratedHeader title="Admin" />
      {unlocked ? (
        <ScrollView keyboardShouldPersistTaps="handled">
          <AdminDashboard />
        </ScrollView>
      ) : (
        <AdminGate onUnlocked={() => setUnlocked(true)} />
      )}
    </IllustratedScreen>
  );
}
