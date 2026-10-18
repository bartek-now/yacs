import { router } from 'expo-router';
import { Text } from 'react-native';
import { Button, Page, styles } from '@/components/ui';
export default function NotFound() {
  return (
    <Page>
      <Text style={styles.title}>Nothing here yet.</Text>
      <Button onPress={() => router.replace('/')}>Back to today</Button>
    </Page>
  );
}
