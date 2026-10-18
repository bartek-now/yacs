import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { localDate, totals } from '@/domain/meals';
import { MealList } from '@/components/MealList';
import { useDiary } from '@/state/diary';
import { Button, colors, Notice, Page, styles } from '@/components/ui';

export default function Today() {
  const [today, setToday] = useState(localDate());
  useEffect(() => {
    const refresh = () => setToday(localDate());
    const timer = setInterval(refresh, 30000);
    const subscription = AppState.addEventListener('change', refresh);
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  const meals = useDiary((s) => s.meals).filter((meal) => meal.date === today);
  const goal = useDiary((s) => s.goal);
  const sum = totals(meals);
  return (
    <Page>
      <View>
        <Text
          style={[
            styles.muted,
            { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
          ]}
        >
          {new Date(`${today}T12:00:00`).toLocaleDateString('en', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.title}>A little more mindful.</Text>
        <Text style={styles.subtitle}>Your day, one meal at a time.</Text>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.ink, borderColor: colors.ink, padding: 24, gap: 22 },
        ]}
      >
        <View style={styles.row}>
          <Text style={{ color: '#E1EDDF', fontSize: 12, letterSpacing: 1 }}>TODAY’S ENERGY</Text>
          <Text style={{ color: colors.green, fontSize: 12 }}>Daily overview</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <Text
            testID="daily-calories"
            style={{ color: colors.white, fontSize: 58, fontWeight: '700', letterSpacing: -2 }}
          >
            {Math.round(sum.calories)}
          </Text>
          <Text style={{ color: '#BCCEC5', fontSize: 16 }}>/ {goal.toLocaleString('en')} kcal</Text>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Daily calorie target"
          accessibilityValue={{ min: 0, max: goal, now: Math.min(sum.calories, goal) }}
          style={{ height: 9, backgroundColor: '#3B5B4E', borderRadius: 8, overflow: 'hidden' }}
        >
          <View
            style={{
              height: 9,
              width: `${Math.min((sum.calories / goal) * 100, 100)}%`,
              backgroundColor: colors.green,
              borderRadius: 8,
            }}
          />
        </View>
        <Text style={{ color: '#D4E2D5', fontSize: 13 }}>
          {sum.calories > goal
            ? `${Math.round(sum.calories - goal)} kcal above your target`
            : `${Math.round(goal - sum.calories)} kcal to your target`}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: '#456153',
            paddingTop: 18,
          }}
        >
          {(['protein', 'carbs', 'fat'] as const).map((key, index) => (
            <View key={key} style={{ flex: 1, gap: 7 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: ['#C8EE92', '#E5C48E', '#D4BCE3'][index],
                  }}
                />
                <Text style={{ color: '#D4E2D5', fontSize: 12 }}>
                  {key[0].toUpperCase() + key.slice(1)}
                </Text>
              </View>
              <Text
                testID={`daily-${key}`}
                style={{ color: colors.white, fontSize: 22, fontWeight: '600' }}
              >
                {sum[key]}
                <Text style={{ fontSize: 13, fontWeight: '400' }}> g</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Button onPress={() => router.push('/meal')}>＋ Add a meal</Button>
      <View style={styles.row}>
        <Text style={styles.section}>On the menu today</Text>
        <Text style={styles.muted}>
          {meals.length} {meals.length === 1 ? 'meal' : 'meals'}
        </Text>
      </View>
      {meals.length ? (
        <MealList meals={meals} />
      ) : (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
          <Text style={{ fontSize: 34 }}>🥣</Text>
          <Text style={styles.section}>A fresh start.</Text>
          <Text style={[styles.muted, { textAlign: 'center', maxWidth: 290 }]}>
            Breakfast, a quick snack, or something special. Start with your first meal.
          </Text>
          <Button secondary onPress={() => router.push('/meal')}>
            Log your first meal
          </Button>
        </View>
      )}
      <Notice>
        Saved on this device. The initial 2,000 kcal target is a placeholder; change it in Settings.
      </Notice>
    </Page>
  );
}
