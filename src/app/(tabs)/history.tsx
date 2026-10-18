import { Text, View } from 'react-native';
import { MealList } from '@/components/MealList';
import { totals } from '@/domain/meals';
import { useDiary } from '@/state/diary';
import { Page, styles } from '@/components/ui';
export default function History() {
  const meals = useDiary((s) => s.meals);
  const dates = [...new Set(meals.map((meal) => meal.date))].sort().reverse();
  return (
    <Page>
      <View>
        <Text style={styles.title}>Your food diary.</Text>
        <Text style={styles.subtitle}>Small moments, all in one place.</Text>
      </View>
      {!dates.length && (
        <View style={styles.card}>
          <Text style={styles.section}>Your story starts with a meal.</Text>
          <Text style={styles.muted}>Saved meals will appear here, grouped by day.</Text>
        </View>
      )}
      {dates.map((date) => {
        const group = meals.filter((meal) => meal.date === date);
        return (
          <View key={date} style={{ gap: 14 }}>
            <View style={styles.row}>
              <Text style={styles.section}>
                {new Date(`${date}T12:00:00`).toLocaleDateString('en', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.muted}>{Math.round(totals(group).calories)} kcal</Text>
            </View>
            <MealList meals={group} />
          </View>
        );
      })}
    </Page>
  );
}
