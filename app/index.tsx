
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
  Platform,
  Modal,
} from "react-native";
import { Plus, CheckCircle2, Trash2, Edit3, Calendar, Filter, X, Search } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO string
  priority: "Low" | "Medium" | "High";
}

const pastelColors = ["#E0E7FF", "#C7D2FE", "#B8B5FF", "#A5B4FC", "#F6F8FC"];
const priorityColors = {
  Low: "#A3F7B5",
  Medium: "#FFF6A3",
  High: "#F67280",
};

const PRIORITY_OPTIONS: Array<Todo["priority"]> = ["Low", "Medium", "High"];

const STORAGE_KEY = "TODO_LIST_V2";

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("Low");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Todo["priority"] | "">("");
  const [filterDate, setFilterDate] = useState<string | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingPriority, setEditingPriority] = useState<Todo["priority"]>("Low");
  const [editingDueDate, setEditingDueDate] = useState<Date | undefined>(undefined);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load todos from storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setTodos(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  // Save todos to storage
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Animate on mount
  useEffect(() => {
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
      {
        id: Date.now().toString(),
        text: input.trim(),
        completed: false,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority,
      },
      ...todos,
    ]);
    setInput("");
    setError("");
    setPriority("Low");
    setDueDate(undefined);
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

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setEditingPriority(todo.priority);
    setEditingDueDate(todo.dueDate ? new Date(todo.dueDate) : undefined);
  };

  const handleSaveEdit = () => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === editingId
          ? {
              ...todo,
              text: editingText,
              priority: editingPriority,
              dueDate: editingDueDate ? editingDueDate.toISOString() : undefined,
            }
          : todo
      )
    );
    setEditingId(null);
    setEditingText("");
    setEditingPriority("Low");
    setEditingDueDate(undefined);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingPriority("Low");
    setEditingDueDate(undefined);
  };

  // Filtering and searching
  const filteredTodos = todos.filter((todo) => {
    if (search && !todo.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && todo.priority !== filterPriority) return false;
    if (filterDate && todo.dueDate && todo.dueDate.slice(0, 10) !== filterDate) return false;
    return true;
  });

  const renderItem = ({ item, index }: { item: Todo; index: number }) => {
    if (editingId === item.id) {
      // Inline edit mode
      return (
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
          <TextInput
            style={[styles.todoText, { flex: 1, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 8 }]}
            value={editingText}
            onChangeText={setEditingText}
            autoFocus
            onSubmitEditing={handleSaveEdit}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.priorityChip, { backgroundColor: priorityColors[editingPriority], marginLeft: 8 }]}
            onPress={() => {
              // Cycle priority
              const idx = PRIORITY_OPTIONS.indexOf(editingPriority);
              setEditingPriority(PRIORITY_OPTIONS[(idx + 1) % PRIORITY_OPTIONS.length]);
            }}
          >
            <Text style={styles.priorityText}>{editingPriority}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => setShowEditDatePicker(true)}
            accessibilityLabel="Edit due date"
          >
            <Calendar color="#7C83FD" size={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={handleSaveEdit}
            accessibilityLabel="Save edit"
          >
            <CheckCircle2 color="#7C83FD" size={26} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={handleCancelEdit}
            accessibilityLabel="Cancel edit"
          >
            <X color="#F67280" size={26} />
          </TouchableOpacity>
          {showEditDatePicker && (
            <DateTimePicker
              value={editingDueDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, date) => {
                setShowEditDatePicker(false);
                if (date) setEditingDueDate(date);
              }}
            />
          )}
        </Animated.View>
      );
    }

    return (
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
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.todoText,
              {
                textDecorationLine: item.completed ? "line-through" : "none",
                color: item.completed ? "#B8B5FF" : "#22223B",
                opacity: item.completed ? 0.6 : 1,
              },
            ]}
            numberOfLines={2}
          >
            {item.text}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 }}>
            <View style={[styles.priorityChip, { backgroundColor: priorityColors[item.priority] }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
            {item.dueDate && (
              <View style={styles.dueDateChip}>
                <Calendar color="#7C83FD" size={16} />
                <Text style={styles.dueDateText}>
                  {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleEdit(item)}
          accessibilityLabel="Edit todo"
        >
          <Edit3 color="#7C83FD" size={22} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
          accessibilityLabel="Delete todo"
        >
          <Trash2 color="#F67280" size={22} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
          style={[styles.priorityChip, { backgroundColor: priorityColors[priority], marginLeft: 4 }]}
          onPress={() => {
            // Cycle priority
            const idx = PRIORITY_OPTIONS.indexOf(priority);
            setPriority(PRIORITY_OPTIONS[(idx + 1) % PRIORITY_OPTIONS.length]);
          }}
        >
          <Text style={styles.priorityText}>{priority}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 4, padding: 8, borderRadius: 8, backgroundColor: dueDate ? "#E0E7FF" : "#fff" }}
          onPress={() => setShowDatePicker(true)}
          accessibilityLabel="Pick due date"
        >
          <Calendar color="#7C83FD" size={22} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddTodo}
          accessibilityLabel="Add todo"
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setDueDate(date);
          }}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search color="#B8B5FF" size={18} style={{ marginRight: 4 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search todos..."
            placeholderTextColor="#B8B5FF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilterModal(true)}
          accessibilityLabel="Filter todos"
        >
          <Filter color="#7C83FD" size={22} />
        </TouchableOpacity>
      </View>
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Todos</Text>
            <Text style={styles.modalLabel}>Priority</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {["", ...PRIORITY_OPTIONS].map((p) => (
                <TouchableOpacity
                  key={p || "all"}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: p
                        ? priorityColors[p as Todo["priority"]]
                        : "#E0E7FF",
                      borderWidth: filterPriority === p ? 2 : 0,
                      borderColor: "#7C83FD",
                    },
                  ]}
                  onPress={() => setFilterPriority(p as Todo["priority"] | "")}
                >
                  <Text style={styles.priorityText}>{p || "All"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Due Date</Text>
            <TouchableOpacity
              style={[
                styles.dueDateChip,
                {
                  backgroundColor: filterDate ? "#E0E7FF" : "#fff",
                  marginBottom: 16,
                },
              ]}
              onPress={() => {
                setShowDatePicker(true);
                setShowFilterModal(false);
              }}
            >
              <Calendar color="#7C83FD" size={18} />
              <Text style={styles.dueDateText}>
                {filterDate
                  ? new Date(filterDate).toLocaleDateString()
                  : "Any"}
              </Text>
              {filterDate ? (
                <TouchableOpacity
                  onPress={() => setFilterDate("")}
                  style={{ marginLeft: 8 }}
                >
                  <X color="#F67280" size={18} />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {showDatePicker && !showFilterModal && (
        <DateTimePicker
          value={filterDate ? new Date(filterDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setFilterDate(date.toISOString().slice(0, 10));
          }}
        />
      )}
      {filteredTodos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No todos found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTodos}
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
    marginLeft: 4,
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
  editBtn: {
    marginLeft: 8,
    padding: 4,
  },
  deleteBtn: {
    marginLeft: 8,
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
  priorityChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
  },
  priorityText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#22223B",
    textAlign: "center",
  },
  dueDateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 0,
    gap: 4,
  },
  dueDateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#7C83FD",
    marginLeft: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#7C83FD",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#22223B",
    paddingVertical: 0,
  },
  filterBtn: {
    backgroundColor: "#E0E7FF",
    borderRadius: 10,
    padding: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(34,34,59,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "85%",
    alignItems: "stretch",
    shadowColor: "#7C83FD",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#7C83FD",
    marginBottom: 16,
    textAlign: "center",
  },
  modalLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#22223B",
    marginBottom: 6,
    marginTop: 8,
  },
  modalCloseBtn: {
    backgroundColor: "#7C83FD",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  modalCloseText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    textAlign: "center",
  },
});