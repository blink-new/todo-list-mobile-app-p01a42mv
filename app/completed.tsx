
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Animated, Easing } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const pastelColors = ["#E0E7FF", "#C7D2FE", "#B8B5FF", "#A5B4FC", "#F6F8FC"];

export default function CompletedScreen() {
  // In a real app, share state via context or storage
  const [todos] = useState<Todo[]>([]); // Placeholder: no completed todos

  // Animate on mount
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const completedTodos = todos.filter((t) => t.completed);

  const renderItem = ({ item, index }: { item: Todo; index: number }) => (
    <Animated.View
      style={[
        styles.todoCard,
        {
          backgroundColor: pastelColors[index % pastelColors.length],
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <CheckCircle2 color="#7C83FD" size={28} strokeWidth={2.5} style={{ marginRight: 14 }} />
      <Text
        style={[
          styles.todoText,
          {
            textDecorationLine: "line-through",
            color: "#B8B5FF",
            opacity: 0.7,
          },
        ]}
      >
        {item.text}
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed</Text>
      {completedTodos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No completed todos yet.</Text>
        </View>
      ) : (
        <FlatList
          data={completedTodos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#7C83FD",
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  todoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: "#7C83FD",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  todoText: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
  },
  emptyText: {
    color: "#B8B5FF",
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    marginTop: 8,
  },
});