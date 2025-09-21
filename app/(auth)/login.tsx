import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/providers/session-provider';

export default function LoginScreen() {
  const { signIn, status } = useSession();
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const placeholderColor = useMemo(
    () => (colorScheme === 'dark' ? '#9BA1A6' : '#687076'),
    [colorScheme],
  );

  const isSubmitting = status === 'authenticating';

  const handleSubmit = async () => {
    if (!host.trim() || !username.trim() || !password) {
      setErrorMessage('Host, username, and password are required.');
      return;
    }

    setErrorMessage(null);

    try {
      await signIn({ host, username, password, apiKey: apiKey.trim() || undefined });
      router.replace('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error signing in.';
      setErrorMessage(message);
      Alert.alert('Could not sign in', message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoider}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.formWrapper}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
            <ThemedText type="title" style={styles.title}>
              Connect your Kavita
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: palette.icon }]}>
              Sign in with your Kavita username and password. You can optionally include your API Key to reuse it in the OPDS reader.
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">Host</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://kavita.mydomain.com"
                placeholderTextColor={placeholderColor}
                style={[
                  styles.input,
                  {
                    borderColor: palette.tabIconDefault,
                    color: palette.text,
                    backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
                  },
                ]}
                value={host}
                onChangeText={setHost}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">Username</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Your username"
                placeholderTextColor={placeholderColor}
                style={[
                  styles.input,
                  {
                    borderColor: palette.tabIconDefault,
                    color: palette.text,
                    backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
                  },
                ]}
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">Password</ThemedText>
              <TextInput
                autoCapitalize="none"
                secureTextEntry
                placeholder="Your password"
                placeholderTextColor={placeholderColor}
                style={[
                  styles.input,
                  {
                    borderColor: palette.tabIconDefault,
                    color: palette.text,
                    backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
                  },
                ]}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">API Key (optional)</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Your API Key"
                placeholderTextColor={placeholderColor}
                style={[
                  styles.input,
                  {
                    borderColor: palette.tabIconDefault,
                    color: palette.text,
                    backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
                  },
                ]}
                value={apiKey}
                onChangeText={setApiKey}
              />
            </View>

            {errorMessage ? (
              <ThemedText style={styles.error}>{errorMessage}</ThemedText>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: isSubmitting }}
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                { backgroundColor: palette.tint },
                isSubmitting && styles.submitButtonDisabled,
              ]}>
              <ThemedText type="defaultSemiBold" style={styles.submitLabel}>
                {isSubmitting ? 'Connecting...' : 'Sign In'}
              </ThemedText>
            </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  form: {
    gap: 20,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  inputGroup: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7DBDF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#11181C',
  },
  error: {
    color: '#E5484D',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitLabel: {
    textAlign: 'center',
    color: '#fff',
  },
});
