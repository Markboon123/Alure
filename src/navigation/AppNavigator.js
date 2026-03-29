// ─────────────────────────────────────────────
// AppNavigator
// Sets up the full navigation structure:
//
//   Root Stack
//   └─ Main Tab Navigator (bottom tabs)
//      ├─ Discover Stack
//      │   └─ DiscoverScreen
//      ├─ Closet Stack
//      │   ├─ ClosetScreen
//      │   ├─ ItemDetailScreen
//      │   └─ AddItemScreen
//      ├─ Outfits Stack
//      │   ├─ OutfitsScreen
//      │   └─ OutfitDetailScreen
//      └─ Events Stack
//          ├─ EventsScreen
//          └─ EventDetailScreen
// ─────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING } from '../constants/theme';

// ── Screens ───────────────────────────────────
import DiscoverScreen        from '../screens/DiscoverScreen';
import GenerateOutfitScreen  from '../screens/GenerateOutfitScreen';
import ClosetScreen          from '../screens/ClosetScreen';
import ItemDetailScreen   from '../screens/ItemDetailScreen';
import AddItemScreen      from '../screens/AddItemScreen';
import OutfitsScreen      from '../screens/OutfitsScreen';
import OutfitDetailScreen from '../screens/OutfitDetailScreen';
import EventsScreen       from '../screens/EventsScreen';
import EventDetailScreen  from '../screens/EventDetailScreen';
import HelpScreen         from '../screens/HelpScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Tab icon component ────────────────────────
function TabIcon({ ionicon, label, focused }) {
  return (
    <View style={tabIconStyles.wrapper}>
      <View style={[tabIconStyles.iconWrap, focused && tabIconStyles.iconWrapFocused]}>
        <Ionicons
          name={focused ? ionicon.replace('-outline', '') : ionicon}
          size={20}
          color={focused ? COLORS.white : COLORS.textLight}
        />
      </View>
      <Text style={[tabIconStyles.label, focused && tabIconStyles.labelFocused]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     SPACING.xs,
    width:          72,
  },
  iconWrap: {
    width:          36,
    height:         36,
    borderRadius:   18,
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconWrapFocused: {
    backgroundColor: COLORS.textDark,
  },
  label: {
    fontSize:      9,
    color:         COLORS.textLight,
    fontFamily:    FONTS.bold,
    letterSpacing: 0,
    marginTop:     2,
  },
  labelFocused: {
    color: COLORS.textDark,
  },
});

// ── Individual stacks ─────────────────────────

function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverHome"   component={DiscoverScreen} />
      <Stack.Screen name="GenerateOutfit" component={GenerateOutfitScreen} />
    </Stack.Navigator>
  );
}

function ClosetStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClosetHome"  component={ClosetScreen} />
      <Stack.Screen name="ItemDetail"  component={ItemDetailScreen} />
      <Stack.Screen name="AddItem"     component={AddItemScreen} />
      {/* OutfitDetail is reachable from ItemDetail */}
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
    </Stack.Navigator>
  );
}

function OutfitsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OutfitsHome"  component={OutfitsScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      {/* ItemDetail is reachable from OutfitDetail */}
      <Stack.Screen name="ItemDetail"   component={ItemDetailScreen} />
    </Stack.Navigator>
  );
}

function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsHome"   component={EventsScreen} />
      <Stack.Screen name="EventDetail"  component={EventDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Main Tab Navigator ────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:     false,
        tabBarStyle:     styles.tabBar,
        tabBarShowLabel: false,  // we render our own label inside TabIcon
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon ionicon="compass-outline" label="Discover" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Closet"
        component={ClosetStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon ionicon="shirt-outline" label="Closet" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Outfits"
        component={OutfitsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon ionicon="layers-outline" label="Outfits" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon ionicon="calendar-outline" label="Events" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root Navigator ────────────────────────────
function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopColor:  COLORS.primaryLight,
    borderTopWidth:  1,
    height:          Platform.OS === 'ios' ? 80 : 64,
    paddingBottom:   Platform.OS === 'ios' ? SPACING.lg : SPACING.sm,
    paddingTop:      SPACING.xs,
  },
});
