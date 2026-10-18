import { useState } from 'react';
import { Text, View } from 'react-native';
import { useDiary } from '@/state/diary';
import { Button, Field, Notice, Page, styles } from '@/components/ui';
function Preferences() {
  const goal = useDiary((s) => s.goal);
  const busy = useDiary((s) => s.busy);
  const [value, setValue] = useState(String(goal));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  return (
    <>
      <View>
        <Text style={styles.title}>Make it yours.</Text>
        <Text style={styles.subtitle}>A few preferences for your everyday.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Daily calorie target</Text>
        <Text style={styles.muted}>
          The initial 2,000 kcal target is a placeholder. Choose your own target; YACS does not
          calculate a personal recommendation.
        </Text>
        <Field
          label="Daily target (kcal)"
          numeric
          value={value}
          onChangeText={(text) => {
            setValue(text);
            setMessage('');
            setError('');
          }}
        />
        {error ? <Notice error>{error}</Notice> : null}
        {message ? <Notice>{message}</Notice> : null}
        <Button
          disabled={busy}
          onPress={async () => {
            try {
              setError('');
              await useDiary.getState().setGoal(Number(value));
              setMessage('Target saved.');
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Save target
        </Button>
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Your data, for now</Text>
        <Text style={styles.muted}>
          Meals stay in this browser or app installation. They are not synced or backed up. Clearing
          app data removes them.
        </Text>
        <Text style={styles.muted}>
          Photos are previewed only. They are not saved or uploaded in demo mode.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>YACS · 0.1</Text>
        <Text style={styles.muted}>
          Yet Another Calorie Scanner. A little less friction around food.
        </Text>
        <Notice>Photo analysis is a demo. You can log real meals manually.</Notice>
      </View>
    </>
  );
}
export default function Settings() {
  return (
    <Page>
      <Preferences />
    </Page>
  );
}
