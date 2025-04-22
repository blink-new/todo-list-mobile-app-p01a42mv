
import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Keyboard, Animated, Easing } from "react-native";
import { Plus, CheckCircle2, Trash2 } from "lucide-react-native";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const pastelColors = ["#E0E7FF", "#C7D2FE", "#B8B5FF", "#A5B4FC", "#F6F8FC"];

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAddTodo = () => {
    if (!input.trim()) {
      setError("Please enter a todo.");
      return;
    }
    setTodos([
      { id: Date.now().toString(), text: input.trim(), completed: false },
      ...todos,
    ]);
    setInput("");
    setError("");
    Keyboard.dismiss();
  };

  const handleToggleComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

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
      <TouchableOpacity
        style={styles.checkCircle}
        onPress={() => handleToggleComplete(item.id)}
        accessibilityLabel={item.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        <CheckCircle2
          color={item.completed ? "#7C83FD" : "#B8B5FF"}
          size={28}
          strokeWidth={item.completed ? 2.5 : 1.5}
          style={{ opacity: item.completed ? 1 : 0.5 }}
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.todoText,
          {
            textDecorationLine: item.completed ? "line-through" : "none",
            color: item.completed ? "#B8B5FF" : "#22223B",
            opacity: item.completed ? 0.6 : 1,
          },
        ]}
      >
        {item.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
        accessibilityLabel="Delete todo"
      >
        <Trash2 color="#F67280" size={22} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Todos</Text>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Add a new todo..."
          placeholderTextColor="#B8B5FF"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAddTodo}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddTodo}
          accessibilityLabel="Add todo"
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {todos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No todos yet. Add your first one!</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#22223B",
    shadowColor: "#7C83FD",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtn: {
    backgroundColor: "#7C83FD",
    borderRadius: 14,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C83FD",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  error: {
    color: "#F67280",
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
    marginLeft: 4,
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
  checkCircle: {
    marginRight: 14,
  },
  todoText: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 4,
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