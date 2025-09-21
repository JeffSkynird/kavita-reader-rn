import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

import type { OpdsEntry, OpdsLink } from '../types';
import { describeLinkType, isAcquisitionLink, isNavigationLink } from '../utils';

type Palette = typeof Colors.light;
type ColorSchemeValue = 'light' | 'dark' | null | undefined;

function pickPrimaryLink(entry: OpdsEntry): OpdsLink | null {
  if (!entry.links.length) {
    return null;
  }

  const acquisitionLink = entry.links.find((link) => isAcquisitionLink(link));
  if (acquisitionLink) {
    return acquisitionLink;
  }

  const navigationLink = entry.links.find((link) => isNavigationLink(link));
  if (navigationLink) {
    return navigationLink;
  }

  const alternateLink = entry.links.find((link) => link.rel?.toLowerCase() === 'alternate');
  return alternateLink ?? entry.links[0];
}

type Props = {
  entry: OpdsEntry;
  palette: Palette;
  colorScheme: ColorSchemeValue;
  onNavigate?: (entry: OpdsEntry, link: OpdsLink) => void;
  style?: StyleProp<ViewStyle>;
};

export function OpdsEntryCard({ entry, palette, colorScheme, onNavigate, style }: Props) {
  const primaryLink = pickPrimaryLink(entry);
  const disabled = !primaryLink;
  const linkDescription = primaryLink ? describeLinkType(primaryLink) : 'unknown';
  const backgroundColor = colorScheme === 'dark' ? '#1F1F23' : '#fff';

  return (
    <Pressable
      accessibilityRole={disabled ? undefined : 'button'}
      accessibilityHint={disabled ? undefined : 'Opens the section content'}
      disabled={disabled}
      onPress={() => {
        if (primaryLink && onNavigate) {
          onNavigate(entry, primaryLink);
        }
      }}
      style={({ pressed }) => [
        styles.card,
        style,
        {
          borderColor: palette.tabIconDefault,
          backgroundColor,
          opacity: pressed && !disabled ? 0.85 : 1,
        },
      ]}>
      <View style={styles.headerRow}>
        <ThemedText type="defaultSemiBold">{entry.title}</ThemedText>
        {primaryLink ? (
          <ThemedText style={[styles.linkHint, { color: palette.tint }]}>
            {linkDescription === 'acquisition' ? 'Open file' : 'View'}
          </ThemedText>
        ) : null}
      </View>
      {entry.content ? <ThemedText style={styles.entryContent}>{entry.content}</ThemedText> : null}
      {entry.links.length ? (
        <View style={styles.linksContainer}>
          {entry.links.map((link,k) => (
            <ThemedText key={`${entry.id}-${link.href}-${k}`} style={[styles.linkLabel, { color: palette.icon }]}>
              {link.rel ?? 'link'} → {link.href}
            </ThemedText>
          ))}
        </View>
      ) : null}
      {disabled ? (
        <ThemedText style={styles.disabledHint}>No navigable links.</ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  entryContent: {
    color: '#687076',
  },
  linksContainer: {
    gap: 4,
  },
  linkLabel: {
    fontSize: 12,
  },
  linkHint: {
    fontSize: 12,
  },
  disabledHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#9BA1A6',
  },
});
