
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
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Appearance,
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

const iosBlue = "#007AFF";
const iosGray = "#F2F2F7";
const iosLightGray = "#FAFAFA";
const iosBorder = "#E5E5EA";
const iosRed = "#FF3B30";
const iosYellow = "#FFD60A";
const iosGreen = "#34C759";
const iosText = "#1C1C1E";
const iosSecondary = "#8E8E93";
const iosShadow = "#00000022";

const priorityColors = {
  Low: iosGreen,
  Medium: iosYellow,
  High: iosRed,
};

const PRIORITY_OPTIONS: Array<Todo["priority"]> = ["Low", "Medium", "High"];
const STORAGE_KEY = "TODO_LIST_V2";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
              borderColor: iosBorder,
              backgroundColor: "#fff",
            },
          ]}
        >
          <TextInput
            style={[
              styles.todoText,
              {
                flex: 1,
                backgroundColor: iosGray,
                borderRadius: 8,
                paddingHorizontal: 8,
                fontSize: 16,
                minHeight: 36,
                color: iosText,
              },
            ]}
            value={editingText}
            onChangeText={setEditingText}
            autoFocus
            onSubmitEditing={handleSaveEdit}
            returnKeyType="done"
            maxLength={80}
            placeholder="Edit todo..."
            placeholderTextColor={iosSecondary}
          />
          <TouchableOpacity
            style={[styles.priorityPill, { backgroundColor: priorityColors[editingPriority], marginLeft: 8 }]}
            onPress={() => {
              // Cycle priority
              const idx = PRIORITY_OPTIONS.indexOf(editingPriority);
              setEditingPriority(PRIORITY_OPTIONS[(idx + 1) % PRIORITY_OPTIONS.length]);
            }}
          >
            <Text style={styles.priorityPillText}>{editingPriority}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => setShowEditDatePicker(true)}
            accessibilityLabel="Edit due date"
          >
            <Calendar color={iosBlue} size={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={handleSaveEdit}
            accessibilityLabel="Save edit"
          >
            <CheckCircle2 color={iosBlue} size={26} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={handleCancelEdit}
            accessibilityLabel="Cancel edit"
          >
            <X color={iosRed} size={26} />
          </TouchableOpacity>
          {showEditDatePicker && (
            <DateTimePicker
              value={editingDueDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowEditDatePicker(false);
                if (date) setEditingDueDate(date);
              }}
              accentColor={iosBlue}
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
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
            borderColor: iosBorder,
            backgroundColor: "#fff",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.checkCircle}
          onPress={() => handleToggleComplete(item.id)}
          accessibilityLabel={item.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          <CheckCircle2
            color={item.completed ? iosBlue : iosSecondary}
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
                color: item.completed ? iosSecondary : iosText,
                opacity: item.completed ? 0.6 : 1,
                fontSize: 16,
                minHeight: 36,
              },
            ]}
            numberOfLines={2}
          >
            {item.text}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 }}>
            <View style={[styles.priorityPill, { backgroundColor: priorityColors[item.priority] }]}>
              <Text style={styles.priorityPillText}>{item.priority}</Text>
            </View>
            {item.dueDate && (
              <View style={styles.dueDatePill}>
                <Calendar color={iosBlue} size={16} />
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
          <Edit3 color={iosBlue} size={22} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
          accessibilityLabel="Delete todo"
        >
          <Trash2 color={iosRed} size={22} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={iosGray} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Reminders</Text>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="New Reminder"
              placeholderTextColor={iosSecondary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
              maxLength={80}
              selectionColor={iosBlue}
            />
            <TouchableOpacity
              style={[styles.priorityPill, { backgroundColor: priorityColors[priority], marginLeft: 4 }]}
              onPress={() => {
                // Cycle priority
                const idx = PRIORITY_OPTIONS.indexOf(priority);
                setPriority(PRIORITY_OPTIONS[(idx + 1) % PRIORITY_OPTIONS.length]);
              }}
              accessibilityLabel="Change priority"
            >
              <Text style={styles.priorityPillText}>{priority}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginLeft: 4,
                padding: 8,
                borderRadius: 8,
                backgroundColor: dueDate ? iosGray : "#fff",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setShowDatePicker(true)}
              accessibilityLabel="Pick due date"
            >
              <Calendar color={iosBlue} size={22} />
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
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setDueDate(date);
              }}
              accentColor={iosBlue}
            />
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search color={iosSecondary} size={18} style={{ marginRight: 4 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={iosSecondary}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                maxLength={40}
                selectionColor={iosBlue}
              />
            </View>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setShowFilterModal(true)}
              accessibilityLabel="Filter todos"
            >
              <Filter color={iosBlue} size={22} />
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
                <Text style={styles.modalTitle}>Filter</Text>
                <Text style={styles.modalLabel}>Priority</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                  {["", ...PRIORITY_OPTIONS].map((p) => (
                    <TouchableOpacity
                      key={p || "all"}
                      style={[
                        styles.priorityPill,
                        {
                          backgroundColor: p
                            ? priorityColors[p as Todo["priority"]]
                            : iosGray,
                          borderWidth: filterPriority === p ? 2 : 0,
                          borderColor: iosBlue,
                        },
                      ]}
                      onPress={() => setFilterPriority(p as Todo["priority"] | "")}
                    >
                      <Text style={styles.priorityPillText}>{p || "All"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.modalLabel}>Due Date</Text>
                <TouchableOpacity
                  style={[
                    styles.dueDatePill,
                    {
                      backgroundColor: filterDate ? iosGray : "#fff",
                      marginBottom: 16,
                    },
                  ]}
                  onPress={() => {
                    setShowDatePicker(true);
                    setShowFilterModal(false);
                  }}
                >
                  <Calendar color={iosBlue} size={18} />
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
                      <X color={iosRed} size={18} />
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
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setFilterDate(date.toISOString().slice(0, 10));
              }}
              accentColor={iosBlue}
            />
          )}
          {filteredTodos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No reminders.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTodos}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 32, paddingTop: 4 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ marginBottom: 8 }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: iosGray,
  },
  container: {
    flex: 1,
    backgroundColor: iosGray,
    paddingTop: 18,
    paddingHorizontal: 12,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_700Bold",
    fontWeight: "700",
    fontSize: 28,
    color: iosText,
    marginBottom: 14,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_400Regular",
    color: iosText,
    borderWidth: 1,
    borderColor: iosBorder,
    minHeight: 40,
    maxWidth: SCREEN_WIDTH - 120,
  },
  addBtn: {
    backgroundColor: iosBlue,
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
    shadowColor: iosShadow,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  error: {
    color: iosRed,
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_400Regular",
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 14,
    textAlign: "center",
  },
  todoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
    shadowColor: iosShadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 56,
  },
  checkCircle: {
    marginRight: 10,
    padding: 4,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_400Regular",
    color: iosText,
  },
  editBtn: {
    marginLeft: 6,
    padding: 4,
  },
  deleteBtn: {
    marginLeft: 6,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  emptyText: {
    color: iosSecondary,
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_400Regular",
    fontSize: 17,
    marginTop: 8,
    textAlign: "center",
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 28,
    backgroundColor: iosGray,
  },
  priorityPillText: {
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_700Bold",
    fontWeight: "600",
    fontSize: 13,
    color: iosText,
    textAlign: "center",
  },
  dueDatePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: iosGray,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 0,
    gap: 4,
    minHeight: 24,
  },
  dueDateText: {
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_400Regular",
    fontSize: 13,
    color: iosBlue,
    marginLeft: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: iosBorder,
    minHeight: 36,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_400Regular",
    fontSize: 15,
    color: iosText,
    paddingVertical: 0,
  },
  filterBtn: {
    backgroundColor: iosGray,
    borderRadius: 12,
    padding: 8,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: iosBorder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(60,60,67,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "92%",
    alignItems: "stretch",
    shadowColor: iosShadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: iosBorder,
  },
  modalTitle: {
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_700Bold",
    fontWeight: "700",
    fontSize: 20,
    color: iosText,
    marginBottom: 16,
    textAlign: "center",
  },
  modalLabel: {
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_700Bold",
    fontWeight: "600",
    fontSize: 15,
    color: iosText,
    marginBottom: 6,
    marginTop: 8,
  },
  modalCloseBtn: {
    backgroundColor: iosBlue,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  modalCloseText: {
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "System" : "Inter_700Bold",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});