import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Meal } from '../domain/meals';
import { colors, styles } from './ui';
export function MealList({ meals }: { meals: Meal[] }) {
  return (
    <View style={{ gap: 12 }}>
      {[...meals]
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((meal) => (
          <Pressable
            key={meal.id}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${meal.name}`}
            onPress={() => router.push({ pathname: '/meal', params: { id: meal.id } })}
            style={[styles.card, { padding: 18, gap: 10 }]}
          >
            <View style={styles.row}>
              <Text
                style={[
                  styles.muted,
                  { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
                ]}
              >
                {meal.category}
                {meal.source === 'demo' ? ' · DEMO' : ''}
              </Text>
              <Text style={styles.muted}>↗</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.ink, flex: 1 }}>
                {meal.name}
              </Text>
              <Text style={{ fontSize: 19, fontWeight: '700', color: colors.ink }}>
                {Math.round(meal.calories)}{' '}
                <Text style={{ fontSize: 11, fontWeight: '400' }}>kcal</Text>
              </Text>
            </View>
            <Text style={styles.muted}>
              P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
            </Text>
          </Pressable>
        ))}
    </View>
  );
}
