import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { MealEditor } from '@/components/MealEditor';
import { Button, Page, styles } from '@/components/ui';
import { useDiary } from '@/state/diary';
function Content() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const meal = useDiary((s) => s.meals.find((item) => item.id === id));
  if (id && !meal)
    return (
      <>
        <Text style={styles.title}>Meal not found.</Text>
        <Button onPress={() => router.replace('/')}>Back to today</Button>
      </>
    );
  return <MealEditor key={id || 'new'} meal={meal} />;
}
export default function MealScreen() {
  return (
    <Page>
      <Content />
    </Page>
  );
}
