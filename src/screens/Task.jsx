import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import notifee, {
  TriggerType,
  AndroidImportance,
  EventType,
  AndroidVisibility,
} from '@notifee/react-native';
import auth from '@react-native-firebase/auth';
import DocumentPicker from '@react-native-documents/picker';

import landing1 from '../assests/LandingPage.png';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

let currentSound = null;

async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'task-alarm',
    name: 'Task Alarm',
    description: 'High priority task alarms with sound',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    lightColor: '#ff6b6b',
    lights: true,
  });
}

const playAudio = async (audioPath) => {
  try {
    console.log('=== PLAYING AUDIO ===');
    console.log('Audio Path:', audioPath);

    if (currentSound) {
      try {
        currentSound.stop();
        currentSound.release();
      } catch (e) {
        console.log('Error stopping previous sound');
      }
      currentSound = null;
    }

    if (!audioPath || audioPath === 'default') {
      console.log('Playing default alarm from bundle');
      currentSound = new Sound('alarm_notification.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load bundle sound:', error);
          return;
        }
        console.log('Default sound loaded successfully');
        currentSound.setNumberOfLoops(-1);
        currentSound.setVolume(1.0);
        currentSound.play((success) => {
          console.log('Play callback - Success:', success);
        });
      });
    } else {
      console.log('Playing custom audio from path:', audioPath);
      currentSound = new Sound(audioPath, '', (error) => {
        if (error) {
          console.log('Failed to load custom audio:', error);
          playAudio('default');
          return;
        }
        console.log('Custom sound loaded successfully');
        currentSound.setNumberOfLoops(-1);
        currentSound.setVolume(1.0);
        currentSound.play((success) => {
          console.log('Play callback - Success:', success);
        });
      });
    }
  } catch (error) {
    console.log('Error in playAudio:', error);
  }
};

const stopAudio = () => {
  console.log('=== STOPPING AUDIO ===');
  if (currentSound) {
    try {
      currentSound.stop();
      currentSound.release();
      currentSound = null;
      console.log('Audio stopped successfully');
    } catch (e) {
      console.log('Error stopping audio:', e);
    }
  }
};

const uploadAudioToFirebase = async (audioUri, userId, taskId) => {
  try {
    const fileName = `${taskId}_${Date.now()}.mp3`;
    const reference = storage().ref(`audios/${userId}/${fileName}`);

    await reference.putFile(audioUri);
    const downloadUrl = await reference.getDownloadURL();

    return downloadUrl;
  } catch (error) {
    console.log('Firebase upload error:', error);
    throw error;
  }
};

const Task = () => {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [audioUri, setAudioUri] = useState('default');
  const [audioName, setAudioName] = useState('default');

  const [editingId, setEditingId] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [userId, setUserId] = useState(null);
  const [playingTaskId, setPlayingTaskId] = useState(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [alarmTaskData, setAlarmTaskData] = useState(null);

  const unsubscribeRefAuth = useRef(null);
  const unsubscribeRefNotifee = useRef(null);
  const unsubscribeRefBackground = useRef(null);
  const unsubscribeRefDatabase = useRef(null);

  /* ================= INIT ================= */
  useEffect(() => {
    createNotificationChannel();

    // Auth subscription
    unsubscribeRefAuth.current = auth().onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        subscribeTasks(user.uid);
      }
    });

    // Foreground notification handler
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      console.log('');
      console.log('========== NOTIFICATION EVENT ==========');
      console.log('Event Type:', type);
      console.log('Detail:', detail);
      console.log('=========================================');
      console.log('');

      const taskId = detail.notification?.data?.taskId;
      const audioUri = detail.notification?.data?.audioUri;
      const taskName = detail.notification?.body;

      if (type === EventType.DELIVERED) {
        console.log('✅ Notification DELIVERED - Starting audio');
        if (audioUri) {
          playAudio(audioUri);
          setIsAlarmActive(true);
          setAlarmTaskData({ taskId, audioUri, taskName });
        }
      } else if (type === EventType.PRESS) {
        console.log('✅ Notification PRESSED - Starting audio');
        if (audioUri) {
          playAudio(audioUri);
          setIsAlarmActive(true);
          setAlarmTaskData({ taskId, audioUri, taskName });
        }
      } else if (type === EventType.ACTION_PRESS) {
        console.log('✅ Action button pressed:', detail.pressAction?.id);

        if (detail.pressAction?.id === 'stop') {
          console.log('User pressed STOP');
          stopAudio();
          setIsAlarmActive(false);
          setAlarmTaskData(null);
        } else if (detail.pressAction?.id === 'complete') {
          console.log('User pressed COMPLETE');
          stopAudio();
          setIsAlarmActive(false);
          setAlarmTaskData(null);

          if (taskId && userId) {
            database()
              .ref(`/tasks/${userId}/${taskId}`)
              .update({ completed: true })
              .then(() => {
                console.log('Task marked as completed');
                Alert.alert('Success', 'Task marked as completed!');
              })
              .catch(err => {
                console.log('Error completing task:', err);
              });
          }
        }
      }
    });

    unsubscribeRefNotifee.current = unsubscribeForeground;

    // Background notification handler
    const unsubscribeBackground = notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('Background notification event:', type);
      if (type === EventType.ACTION_PRESS) {
        if (detail.pressAction?.id === 'stop') {
          stopAudio();
        }
      }
    });

    unsubscribeRefBackground.current = unsubscribeBackground;

    return () => {
      if (unsubscribeRefAuth.current) {
        unsubscribeRefAuth.current();
      }
      if (unsubscribeRefNotifee.current) {
        unsubscribeRefNotifee.current();
      }
      if (unsubscribeRefBackground.current) {
        unsubscribeRefBackground.current();
      }
      if (unsubscribeRefDatabase.current) {
        unsubscribeRefDatabase.current();
      }
      stopAudio();
    };
  }, [userId]);

  /* ================= REALTIME TASKS ================= */
  const subscribeTasks = uid => {
    const dbRef = database().ref(`/tasks/${uid}`);
    
    dbRef.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(id => ({
        id,
        ...data[id],
      }));
      list.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(list);
    });

    unsubscribeRefDatabase.current = () => {
      dbRef.off();
    };
  };

  /* ================= TIME FORMAT ================= */
  const formatTime = date => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  /* ================= AUDIO PICK ================= */
  const pickAudio = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });
      setAudioUri(res[0].uri);
      setAudioName(res[0].name);
      Alert.alert('Success', 'Audio file selected: ' + res[0].name);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        console.log(e);
        Alert.alert('Error', 'Failed to pick audio');
      }
    }
  };

  /* ================= SCHEDULE ALARM ================= */
  const scheduleAlarm = async (title, date, taskId, audioPath) => {
    try {
      console.log('');
      console.log('========== SCHEDULING ALARM ==========');
      console.log('Title:', title);
      console.log('Date:', date);
      console.log('TaskId:', taskId);
      console.log('AudioPath:', audioPath);
      console.log('=====================================');
      console.log('');

      const timestamp = date.getTime();
      const now = Date.now();

      if (timestamp <= now) {
        Alert.alert('Error', 'Please select a future time');
        return;
      }

      await notifee.createTriggerNotification(
        {
          title: '⏰ Task Reminder',
          body: title,
          data: {
            taskId,
            audioUri: audioPath,
          },
          android: {
            channelId: 'task-alarm',
            smallIcon: 'ic_launcher',
            sound: 'default',
            importance: AndroidImportance.HIGH,
            visibility: AndroidVisibility.PUBLIC,
            bigText: title,
            lights: [0xff6b6b, 500, 500],
            vibrationPattern: [0, 500, 250, 500],
            actions: [
              { title: '⏹ Stop', pressAction: { id: 'stop' } },
              { title: '✅ Complete', pressAction: { id: 'complete' } },
            ],
          },
          ios: {
            sound: 'default',
            badgeCount: 1,
            critical: true,
            criticalVolume: 1,
            launchImageName: '',
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: timestamp,
        }
      );

      console.log('✅ Alarm scheduled successfully for:', new Date(timestamp));
    } catch (error) {
      console.log('❌ Schedule alarm error:', error);
      Alert.alert('Error', 'Failed to schedule alarm: ' + error.message);
    }
  };

  /* ================= SAVE TASK ================= */
  const saveTask = async () => {
    if (!taskName || !category || !startTime || !endTime) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    const alarmDate = new Date();
    const [h, m] = startTime.split(':');
    alarmDate.setHours(+h);
    alarmDate.setMinutes(+m);
    alarmDate.setSeconds(0);

    try {
      setUploading(true);
      let finalAudioUri = audioUri;

      if (audioUri !== 'default' && audioUri && !audioUri.startsWith('http')) {
        const taskId = editingId || `task_${Date.now()}`;
        finalAudioUri = await uploadAudioToFirebase(audioUri, userId, taskId);
      }

      const payload = {
        taskName,
        category,
        startTime,
        endTime,
        audio: finalAudioUri,
        audioName: audioName,
        completed: false,
        createdAt: Date.now(),
      };

      if (editingId) {
        await database().ref(`/tasks/${userId}/${editingId}`).update(payload);
        Alert.alert('Success', 'Task updated!');
      } else {
        const ref = database().ref(`/tasks/${userId}`).push();
        await ref.set(payload);
        await scheduleAlarm(taskName, alarmDate, ref.key, finalAudioUri);
        Alert.alert('Success', 'Task created and alarm scheduled!');
      }

      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTaskName('');
    setCategory('');
    setStartTime('');
    setEndTime('');
    setAudioUri('default');
    setAudioName('default');
    setEditingId(null);
    setShowForm(false);
  };

  const deleteTask = id => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          database().ref(`/tasks/${userId}/${id}`).remove();
        },
      },
    ]);
  };

  const editTask = task => {
    setTaskName(task.taskName);
    setCategory(task.category);
    setStartTime(task.startTime);
    setEndTime(task.endTime);
    setAudioUri(task.audio || 'default');
    setAudioName(task.audioName || 'default');
    setEditingId(task.id);
    setShowForm(true);
  };

  const handlePlayAudio = audioPath => {
    if (playingTaskId === audioPath) {
      stopAudio();
      setPlayingTaskId(null);
    } else {
      playAudio(audioPath);
      setPlayingTaskId(audioPath);
    }
  };

  const handleStopAlarm = () => {
    console.log('User clicked STOP button');
    stopAudio();
    setIsAlarmActive(false);
    setAlarmTaskData(null);
  };

  const handleCompleteAlarm = async () => {
    console.log('User clicked COMPLETE button');
    stopAudio();

    if (alarmTaskData?.taskId && userId) {
      try {
        await database()
          .ref(`/tasks/${userId}/${alarmTaskData.taskId}`)
          .update({ completed: true });

        setIsAlarmActive(false);
        setAlarmTaskData(null);
        Alert.alert('Success', 'Task marked as completed!');
      } catch (error) {
        console.log('Error completing task:', error);
      }
    }
  };

  /* ================= UI ================= */
  return (
    <ImageBackground source={landing1} style={styles.container}>
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => setShowForm(!showForm)}
        disabled={uploading}>
        <Text style={styles.toggleText}>
          {showForm ? 'Close Task Form' : 'Create New Task'}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Task Name"
            placeholderTextColor="#aaa"
            value={taskName}
            onChangeText={setTaskName}
            editable={!uploading}
          />

          <TextInput
            style={styles.input}
            placeholder="Category"
            placeholderTextColor="#aaa"
            value={category}
            onChangeText={setCategory}
            editable={!uploading}
          />

          <TouchableOpacity
            style={styles.timeBtn}
            onPress={() => setShowStartPicker(true)}
            disabled={uploading}>
            <Text style={styles.btnText}>{startTime || 'Start Time'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeBtn}
            onPress={() => setShowEndPicker(true)}
            disabled={uploading}>
            <Text style={styles.btnText}>{endTime || 'End Time'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeBtn}
            onPress={pickAudio}
            disabled={uploading}>
            <Text style={styles.btnText}>🎵 {audioName}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, uploading && { opacity: 0.6 }]}
            onPress={saveTask}
            disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>{editingId ? 'Update' : 'Save'}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {showStartPicker && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          onChange={(e, d) => {
            setShowStartPicker(false);
            d && setStartTime(formatTime(d));
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          onChange={(e, d) => {
            setShowEndPicker(false);
            d && setEndTime(formatTime(d));
          }}
        />
      )}

      {/* Alarm Modal */}
      <Modal visible={isAlarmActive} transparent={true} animationType="slide">
        <View style={styles.alarmModal}>
          <View style={styles.alarmContent}>
            <Text style={styles.alarmTitle}>⏰ ALARM!</Text>
            <Text style={styles.alarmSubtitle}>
              {alarmTaskData?.taskName || 'Task Reminder'}
            </Text>

            <View style={styles.alarmButtonContainer}>
              <TouchableOpacity
                style={[styles.alarmButton, styles.stopAlarmBtn]}
                onPress={handleStopAlarm}>
                <Icon name="stop" size={30} color="#fff" />
                <Text style={styles.alarmButtonText}>Stop</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.alarmButton, styles.completeAlarmBtn]}
                onPress={handleCompleteAlarm}>
                <Icon name="check" size={30} color="#fff" />
                <Text style={styles.alarmButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.taskList}>
        {tasks.map(task => (
          <View key={task.id} style={[styles.card, { width: cardWidth }]}>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handlePlayAudio(task.audio)}>
                <Icon
                  name={playingTaskId === task.audio ? 'pause' : 'play'}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => editTask(task)}>
                <Icon name="edit" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(task.id)}>
                <Icon name="trash" size={16} color="#ff5555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{task.taskName}</Text>
            <Text style={styles.category}>{task.category}</Text>
            <Text style={styles.time}>
              {task.startTime} - {task.endTime}
            </Text>
            <Text style={styles.audioName}>🎵 {task.audioName}</Text>

            {task.completed && (
              <Text style={styles.completed}>✔ Completed</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

export default Task;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, alignItems: 'center' },

  toggleBtn: { backgroundColor: '#69af80', padding: 14, borderRadius: 16 },
  toggleText: { color: '#fff', fontSize: 18 },

  form: {
    backgroundColor: '#bf9178',
    width: '90%',
    padding: 16,
    borderRadius: 18,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#1E2746',
    color: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  timeBtn: {
    backgroundColor: '#1E2746',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  btnText: { color: '#fff' },

  saveBtn: {
    backgroundColor: '#451667',
    padding: 14,
    borderRadius: 14,
    minHeight: 50,
    justifyContent: 'center',
  },

  saveText: { color: '#fff', textAlign: 'center', fontWeight: '700' },

  alarmModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  alarmContent: {
    backgroundColor: '#ff6b6b',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
  },

  alarmTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },

  alarmSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },

  alarmButtonContainer: {
    flexDirection: 'row',
    gap: 20,
  },

  alarmButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 120,
  },

  stopAlarmBtn: {
    backgroundColor: '#c92a2a',
  },

  completeAlarmBtn: {
    backgroundColor: '#2f9e44',
  },

  alarmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
  },

  taskList: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  card: {
    backgroundColor: '#bf9178',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },

  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: { color: '#fff', fontWeight: '700', marginTop: 6 },
  category: { color: '#eee', fontSize: 12 },
  time: { color: '#fff', marginTop: 4 },
  audioName: { color: '#ffeb3b', fontSize: 11, marginTop: 4 },
  completed: { color: '#00ff99', marginTop: 6 },
});