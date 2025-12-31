import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const TaskGrid = () => {
  const [tasks, setTasks] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const ref = database().ref(`/tasks/${user.uid}`);

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));

      // newest first
      list.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(list);
    });

    return () => ref.off('value', listener);
  }, []);

  const deleteTask = async id => {
    const user = auth().currentUser;
    if (!user) return;
    await database().ref(`/tasks/${user.uid}/${id}`).remove();
  };

  const editTask = task => {
    navigation.navigate('Task', { task }); // handled in Task screen
  };

  const width = Dimensions.get('window').width;
  const cardWidth = (width - 50) / 3;

  return (
    <View style={styles.container}>
      {tasks.map(task => (
        <View key={task.id} style={[styles.card, { width: cardWidth }]}>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => editTask(task)}>
              <Icon name="edit" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(task.id)}>
              <Icon name="trash" size={16} color="#ff4444" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{task.taskName}</Text>
          <Text style={styles.category}>{task.category}</Text>
          <Text style={styles.time}>
            {task.startTime} - {task.endTime}
          </Text>

          {task.completed && (
            <Text style={{ color: '#00ff99', marginTop: 4 }}>✔ Completed</Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default TaskGrid;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#bf9178',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  category: {
    color: '#1E2746',
    fontSize: 12,
  },
  time: {
    color: '#fff',
    fontSize: 12,
  },
});
