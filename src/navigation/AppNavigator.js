// ─────────────────────────────────────────────
// AppNavigator
// Swipeable tabs using MaterialTopTabNavigator
// with a custom bottom tab bar
// ─────────────────────────────────────────────

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING } from '../constants/theme';

// ── Screens ───────────────────────────────────
import DiscoverScreen       from '../screens/DiscoverScreen';
import GenerateOutfitScreen from '../screens/GenerateOutfitScreen';
import ClosetScreen         from '../screens/ClosetScreen';
import ItemDetailScreen     from '../screens/ItemDetailScreen';
import AddItemScreen        from '../screens/AddItemScreen';
import OutfitsScreen        from '../screens/OutfitsScreen';
import OutfitDetailScreen   from '../screens/OutfitDetailScreen';
import EventsScreen         from '../screens/EventsScreen';
import EventDetailScreen    from '../screens/EventDetailScreen';
import HelpScreen           from '../screens/HelpScreen';

const TopTab = createMaterialTopTabNavigator();
const Stack  = createStackNavigator();

// ── Tab definitions ───────────────────────────
const TABS = [
  { name: 'Discover', ionicon: 'compass-outline' },
  { name: 'Closet',   ionicon: 'shirt-outline'   },
  { name: 'Outfits',  ionicon: 'layers-outline'  },
  { name: 'Events',   ionicon: 'calendar-outline' },
];

// ── Custom bottom tab bar ─────────────────────
function BottomTabBar({ state, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS.find(t => t.name === route.name) || TABS[0];

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => navigation.navigate(route.name)}
            accessibilityLabel={tab.name}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
              <Ionicons
                name={focused ? tab.ionicon.replace('-outline', '') : tab.ionicon}
                size={20}
                color={focused ? COLORS.white : COLORS.textLight}
              />
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
              {tab.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
      <Stack.Screen name="ClosetHome"   component={ClosetScreen} />
      <Stack.Screen name="ItemDetail"   component={ItemDetailScreen} />
      <Stack.Screen name="AddItem"      component={AddItemScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
    </Stack.Navigator>
  );
}

function OutfitsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OutfitsHome"  component={OutfitsScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      <Stack.Screen name="ItemDetail"   component={ItemDetailScreen} />
    </Stack.Navigator>
  );
}

function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsHome"  component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Swipeable main tabs ───────────────────────
function MainTabs() {
  return (
    <TopTab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <TopTab.Screen name="Discover" component={DiscoverStack} />
      <TopTab.Screen name="Closet"   component={ClosetStack} />
      <TopTab.Screen name="Outfits"  component={OutfitsStack} />
      <TopTab.Screen name="Events"   component={EventsStack} />
    </TopTab.Navigator>
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
    flexDirection:   'row',
    backgroundColor: COLORS.background,
    borderTopWidth:  1,
    borderTopColor:  COLORS.primaryLight,
    height:          Platform.OS === 'ios' ? 80 : 64,
    paddingBottom:   Platform.OS === 'ios' ? SPACING.lg : SPACING.sm,
    paddingTop:      SPACING.xs,
  },

  tabItem: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
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

  tabLabel: {
    fontSize:      9,
    color:         COLORS.textLight,
    fontFamily:    FONTS.bold,
    letterSpacing: 0,
    marginTop:     2,
  },

  tabLabelFocused: {
    color: COLORS.textDark,
  },
});
