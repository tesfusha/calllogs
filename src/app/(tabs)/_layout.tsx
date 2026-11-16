import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TablerIcon, type TablerIconName } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';

function TabIcon({ name, focused }: { name: TablerIconName; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <TablerIcon
        name={name}
        color={focused ? Colors.accent : Colors.textSecondary}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.text,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dialer',
          tabBarAccessibilityLabel: 'Dialer',
          tabBarIcon: ({ focused }) => <TabIcon name="phone" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarAccessibilityLabel: 'Analytics',
          tabBarIcon: ({ focused }) => <TabIcon name="trending-up" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="usage"
        options={{
          title: 'Calls Usage',
          tabBarAccessibilityLabel: 'Calls Usage',
          tabBarIcon: ({ focused }) => <TabIcon name="chart-pie" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="backup"
        options={{
          title: 'Backup',
          tabBarAccessibilityLabel: 'Backup',
          tabBarIcon: ({ focused }) => <TabIcon name="device-floppy" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconWrap: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.accentSoft,
  },
});
