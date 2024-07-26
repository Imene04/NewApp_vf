// Ajout du style et du design du composant calendrier
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import Icon from 'react-native-vector-icons/Ionicons';

dayjs.locale('fr');

const App = () => {
  const [currentDay, setCurrentDay] = useState(dayjs());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://ikalas.com/api/v1/ik-slots',
        { startDate, endDate },
        {
          headers: {
            'apikey': 'IK-HJQT0XWDYA2I2B000NVD',
            'Content-Type': 'application/json',
          },
        }
      );

      setSlots(response.data.result);
    } catch (error) {
      console.error('Erreur lors de la récupération des slots', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startDate = currentDay.startOf('day');
    const endDate = currentDay.add(6, 'day').endOf('day');
    fetchSlots(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  }, [currentDay]);

  const handlePreviousWeek = () => {
    const newCurrentDay = currentDay.subtract(7, 'day');
    setCurrentDay(newCurrentDay);
  };

  const handleNextWeek = () => {
    const newCurrentDay = currentDay.add(7, 'day');
    setCurrentDay(newCurrentDay);
  };

  const getDaySlots = (day) => {
    const daySlots = slots.filter(slot => dayjs(slot.start).isSame(day, 'day'));

    // Create a list of all slots from 8:30 to 17:00 with gaps
    const allSlots = [];
    let currentTime = day.startOf('day').hour(8).minute(30);
    const endTime = day.startOf('day').hour(17).minute(0);

    while (currentTime.isBefore(endTime)) {
      const nextTime = currentTime.add(30, 'minute');
      allSlots.push({
        start: currentTime,
        end: nextTime,
        available: !daySlots.some(slot => dayjs(slot.start).isSame(currentTime) && dayjs(slot.end).isSame(nextTime)),
      });
      currentTime = nextTime;
    }

    return allSlots;
  };

  const renderSlot = ({ item }) => (
    <TouchableOpacity style={styles.slot}>
      <Text style={styles.slotText}>
        {item.available ? dayjs(item.start).format('HH:mm') : '-'}
      </Text>
    </TouchableOpacity>
  );

  const renderDay = (day) => {
    const daySlots = getDaySlots(day);

    return (
      <View style={styles.dayColumn}>
        <View style={styles.dayContainer}>
          <Text style={styles.day}>{day.format('dddd')}</Text>
          <Text style={styles.date}>{day.format('DD MMM YYYY')}</Text>
        </View>
        <FlatList
          data={daySlots}
          renderItem={renderSlot}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const days = Array.from({ length: 7 }, (_, i) => currentDay.add(i, 'day'));

  const today = dayjs().startOf('day');
  const isPreviousDisabled = currentDay.isSame(today, 'day') || currentDay.isBefore(today, 'day');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousWeek} disabled={isPreviousDisabled} style={isPreviousDisabled ? styles.disabledArrow : styles.arrow}>
          <Icon name="arrow-back" size={30} color={isPreviousDisabled ? 'gray' : 'black'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextWeek} style={styles.arrow}>
          <Icon name="arrow-forward" size={30} color="black" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.calendar}>
          {days.map(day => renderDay(day))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  arrow: {
    padding: 10,
  },
  disabledArrow: {
    padding: 10,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dayContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  day: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  slot: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderRadius: 5,
  },
  slotText: {
    fontSize: 14,
  },
});

export default App;
