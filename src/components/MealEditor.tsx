import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import {
  categories,
  localDate,
  Meal,
  Nutrition,
  nutritionKeys,
  scaleNutrition,
  validateMeal,
} from '../domain/meals';
import { demoEstimator } from '../services/estimator';
import { useDiary } from '../state/diary';
import { Button, colors, Field, Notice, styles } from './ui';

const labels = {
  calories: 'Calories (kcal)',
  protein: 'Protein (g)',
  carbs: 'Carbs (g)',
  fat: 'Fat (g)',
};
const toFields = (values: Nutrition) =>
  Object.fromEntries(nutritionKeys.map((key) => [key, String(values[key])])) as Record<
    keyof Nutrition,
    string
  >;
const parseNumber = (value: string) => (value.trim() ? Number(value.replace(',', '.')) : NaN);

export function MealEditor({ meal }: { meal?: Meal }) {
  const [name, setName] = useState(meal?.name || '');
  const [date, setDate] = useState(meal?.date || localDate());
  const [category, setCategory] = useState<Meal['category']>(meal?.category || 'Lunch');
  const [notes, setNotes] = useState(meal?.notes || '');
  const [source, setSource] = useState<Meal['source']>(meal?.source || 'manual');
  const [values, setValues] = useState<Record<keyof Nutrition, string>>(
    meal ? toFields(meal) : { calories: '', protein: '', carbs: '', fat: '' },
  );
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<'delete' | 'discard' | null>(null);
  const [portion, setPortion] = useState('1');
  const busy = useDiary((s) => s.busy) || pending;
  const nutrition = () =>
    Object.fromEntries(nutritionKeys.map((key) => [key, parseNumber(values[key])])) as Nutrition;
  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const dirty =
    photo !== null ||
    name !== (meal?.name || '') ||
    notes !== (meal?.notes || '') ||
    date !== (meal?.date || localDate()) ||
    category !== (meal?.category || 'Lunch') ||
    nutritionKeys.some((key) => values[key] !== (meal ? String(meal[key]) : ''));

  async function pick(camera: boolean) {
    setError('');
    try {
      if (camera && Platform.OS !== 'web') {
        const result = await ImagePicker.requestCameraPermissionsAsync();
        if (!result.granted)
          throw new Error(
            'Camera permission is needed to take a photo. You can choose a photo instead.',
          );
      }
      // On web this call must stay inside the user gesture, with no awaited permission prompt.
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
      const result = await (camera
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));
      if (!result.canceled) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 15 * 1024 * 1024)
          throw new Error('Choose an image smaller than 15 MB.');
        setPhoto(asset.uri);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not open this photo. Please try another image.',
      );
    }
  }
  async function estimate() {
    setPending(true);
    setError('');
    try {
      const result = await demoEstimator.estimate({ uri: photo || '', notes });
      setName(result.name);
      setValues(toFields(result.nutrition));
      setSource(result.source);
      setPortion('1');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function save() {
    setError('');
    const next: Meal = {
      ...nutrition(),
      id: meal?.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: meal?.createdAt || new Date().toISOString(),
      name: name.trim(),
      date,
      category,
      source,
      notes: notes.trim(),
    };
    const invalid = validateMeal(next);
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      await useDiary.getState().saveMeal(next);
      exit();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{meal ? 'A second look.' : 'What’s on your plate?'}</Text>
          <Text style={styles.subtitle}>
            {meal
              ? 'Make a correction, keep your diary yours.'
              : 'Start with a photo, or fill in the details.'}
          </Text>
        </View>
      </View>
      {!meal && (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.section}>Photo log</Text>
            <Text
              style={{
                backgroundColor: '#E8EEDC',
                color: colors.ink,
                fontSize: 10,
                letterSpacing: 1,
                fontWeight: '700',
                padding: 8,
                borderRadius: 8,
              }}
            >
              DEMO
            </Text>
          </View>
          <Text style={styles.muted}>
            Try the photo-to-meal flow. AI analysis is not connected yet; the demo always returns
            the same sample values.
          </Text>
          {photo ? (
            <>
              <Image
                accessibilityLabel="Selected meal photo"
                source={{ uri: photo }}
                style={{ width: '100%', height: 200, borderRadius: 14 }}
                resizeMode="cover"
              />
              <Button secondary onPress={() => setPhoto(null)}>
                Remove photo
              </Button>
            </>
          ) : null}
          <View style={{ gap: 10 }}>
            <Button secondary onPress={() => void pick(true)}>
              Take a photo
            </Button>
            <Button secondary onPress={() => void pick(false)}>
              Choose a photo
            </Button>
          </View>
          {photo ? (
            <Button disabled={busy} onPress={() => void estimate()}>
              Use sample estimate
            </Button>
          ) : null}
          <Text style={[styles.muted, { fontSize: 12 }]}>
            Photos stay on your device and are not saved with the meal in this version.
          </Text>
        </View>
      )}
      {source === 'demo' && (
        <Notice>
          Sample values only — your photo has not been analyzed. Review all values. This entry will
          stay labeled as a demo.
        </Notice>
      )}
      <View style={styles.card}>
        <Text style={styles.section}>Meal details</Text>
        <Field
          label="Meal name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Eggs on sourdough"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={item}
              accessibilityState={{ selected: item === category }}
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                item === category && { backgroundColor: colors.green, borderColor: colors.green },
              ]}
            >
              <Text style={styles.label}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <Field
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Ingredients, cooking oil, or anything to remember…"
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Nutrition</Text>
        <Text style={styles.muted}>
          Enter totals for the portion you ate. Use 0 where appropriate.
        </Text>
        <Field
          label={labels.calories}
          value={values.calories}
          onChangeText={(text) => setValues((v) => ({ ...v, calories: text }))}
          numeric
        />
        <View style={{ gap: 14 }}>
          {(['protein', 'carbs', 'fat'] as const).map((key) => (
            <Field
              key={key}
              label={labels[key]}
              value={values[key]}
              onChangeText={(text) => setValues((v) => ({ ...v, [key]: text }))}
              numeric
            />
          ))}
        </View>
        <Field label="Portion multiplier" value={portion} onChangeText={setPortion} numeric />
        <Button
          secondary
          disabled={busy}
          onPress={() => {
            setError('');
            try {
              const current = nutrition();
              if (nutritionKeys.some((key) => !Number.isFinite(current[key]) || current[key] < 0))
                throw new Error('Fill in valid nutrition values before scaling.');
              const next = scaleNutrition(current, parseNumber(portion));
              if (nutritionKeys.some((key) => next[key] > 100000))
                throw new Error('Scaled nutrition values must not exceed 100,000.');
              setValues(toFields(next));
              setPortion('1');
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Apply portion multiplier
        </Button>
      </View>
      {error ? <Notice error>{error}</Notice> : null}
      <Button disabled={busy} onPress={() => void save()}>
        {busy ? 'Saving…' : meal ? 'Save changes' : 'Save meal'}
      </Button>
      <Button secondary disabled={busy} onPress={() => (dirty ? setConfirm('discard') : exit())}>
        Cancel
      </Button>
      {meal ? (
        <Button secondary disabled={busy} onPress={() => setConfirm('delete')}>
          Delete meal
        </Button>
      ) : null}
      {confirm ? (
        <View style={styles.card}>
          <Text style={styles.section}>
            {confirm === 'delete' ? 'Delete this meal?' : 'Discard your changes?'}
          </Text>
          <Text style={styles.muted}>
            {confirm === 'delete'
              ? 'This removes the meal from your diary and daily totals.'
              : 'Your unsaved changes will be lost.'}
          </Text>
          <Button
            disabled={busy}
            onPress={async () => {
              if (confirm === 'delete' && meal) {
                try {
                  await useDiary.getState().deleteMeal(meal.id);
                  exit();
                } catch (e) {
                  setError((e as Error).message);
                  setConfirm(null);
                }
              } else exit();
            }}
          >
            {confirm === 'delete' ? 'Confirm delete' : 'Discard changes'}
          </Button>
          <Button secondary disabled={busy} onPress={() => setConfirm(null)}>
            Keep editing
          </Button>
        </View>
      ) : null}
    </>
  );
}
