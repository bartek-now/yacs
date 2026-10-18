import { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiary } from '../state/diary';

export const colors = {
  bg: '#F6F7F2',
  ink: '#193D34',
  muted: '#63746A',
  green: '#C5EB94',
  line: '#DFE5DB',
  white: '#FFFFFF',
  error: '#A33135',
};
export function Page({ children }: { children: ReactNode }) {
  const ready = useDiary((s) => s.ready);
  const error = useDiary((s) => s.storageError);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.page}>
            <View style={styles.brand}>
              <Text style={styles.logo}>
                yacc<Text style={{ color: '#719B48' }}>.</Text>
              </Text>
              <Text style={styles.eyebrow}>YET ANOTHER{'\n'}CALORIE COUNTER</Text>
            </View>
            {!ready ? (
              <ActivityIndicator accessibilityLabel="Loading diary" color={colors.ink} />
            ) : error ? (
              <Notice error>{error}</Notice>
            ) : (
              children
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Button({
  children,
  onPress,
  secondary,
  disabled,
  testID,
}: {
  children: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && { color: colors.ink }]}>{children}</Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  numeric,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  numeric?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#839086"
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 84, textAlignVertical: 'top' }]}
      />
    </View>
  );
}
export function Notice({ children, error }: { children: ReactNode; error?: boolean }) {
  return (
    <View style={[styles.notice, error && { backgroundColor: '#FBEAEC' }]}>
      <Text
        accessibilityRole={error ? 'alert' : undefined}
        style={{ color: error ? colors.error : colors.muted, lineHeight: 21, fontSize: 13 }}
      >
        {children}
      </Text>
    </View>
  );
}
export const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 32 },
  page: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 22, gap: 22 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 13,
    paddingBottom: 6,
  },
  logo: { fontSize: 38, fontWeight: '900', letterSpacing: -2, color: colors.ink },
  eyebrow: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 1.6,
    fontWeight: '700',
    textAlign: 'right',
  },
  title: { fontSize: 33, color: colors.ink, fontWeight: '700', letterSpacing: -1.2 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 5 },
  section: { fontSize: 20, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#CBD5C8',
    borderRadius: 12,
    padding: 14,
    color: colors.ink,
    fontSize: 16,
    minHeight: 50,
  },
  button: {
    minHeight: 52,
    backgroundColor: colors.ink,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  secondary: { backgroundColor: '#E7EFDF' },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  notice: { padding: 15, borderRadius: 14, backgroundColor: '#EBEEE6' },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: colors.white,
  },
});
