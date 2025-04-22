
import { Stack, Tabs } from "expo-router";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    // Required for react-native-gesture-handler
    // No-op, just to ensure import
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6F8FC" }}>
        <ActivityIndicator size="large" color="#7C83FD" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#7C83FD",
          tabBarInactiveTintColor: "#B8B5FF",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            height: 64,
            shadowColor: "#7C83FD",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontFamily: "Inter_700Bold",
            fontSize: 14,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Todos",
            tabBarIcon: ({ color, size }) => {
              const { ListTodo } = require("lucide-react-native");
              return <ListTodo color={color} size={size ?? 24} />;
            },
          }}
        />
        <Tabs.Screen
          name="completed"
          options={{
            title: "Completed",
            tabBarIcon: ({ color, size }) => {
              const { CheckCircle2 } = require("lucide-react-native");
              return <CheckCircle2 color={color} size={size ?? 24} />;
            },
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}