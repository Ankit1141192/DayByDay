import Sound from 'react-native-sound';

export const playSound = (file) => {
  const alarm = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
    if (!error) alarm.play();
  });
};
