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
  const [hoveredSlot, setHoveredSlot] = useState(null); // État pour gérer l'effet de survol

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

      if (Array.isArray(response.data.result)) {
        setSlots(response.data.result);
      } else {
        console.error('La réponse de l\'API ne contient pas un tableau sous la clé "result":', response.data);
        setSlots([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des slots', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startDate = currentDay.startOf('week').format('YYYY-MM-DD');
    const endDate = currentDay.endOf('week').format('YYYY-MM-DD');
    fetchSlots(startDate, endDate);
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

    const allSlots = [];
    let currentTime = day.startOf('day').hour(8).minute(0);
    const endTime = day.startOf('day').hour(18).minute(0);

    const slotDuration = 30;
    while (currentTime.isBefore(endTime)) {
      allSlots.push({
        start: currentTime,
        available: daySlots.some(slot => dayjs(slot.start).isSame(currentTime)),
      });
      currentTime = currentTime.add(slotDuration, 'minute');
    }

    return allSlots;
  };

  const renderSlot = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.slot,
        !item.available && styles.slotEmpty,
        hoveredSlot === index && styles.slotHovered // Appliquer le style de survol
      ]}
      onPressIn={() => setHoveredSlot(index)} // Activer l'effet de survol
      onPressOut={() => setHoveredSlot(null)} // Désactiver l'effet de survol
    >
      <Text style={styles.slotText}>
        {item.available ? `${dayjs(item.start).format('HH:mm')}` : '-'}
      </Text>
    </TouchableOpacity>
  );

  const renderDay = (day) => {
    const daySlots = getDaySlots(day);

    return (
      <View style={styles.dayColumn}>
        <View style={styles.dayContainer}>
          <Text style={styles.day}>{day.format('dddd')}</Text>
          <Text style={styles.date}>{day.format('DD MMM')}</Text>
        </View>
        <FlatList
          data={daySlots}
          renderItem={renderSlot}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const days = Array.from({ length: 7 }, (_, i) => currentDay.startOf('week').add(i, 'day'));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousWeek} style={styles.arrow}>
          <Icon name="arrow-back" size={30} color="#3498DB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextWeek} style={styles.arrow}>
          <Icon name="arrow-forward" size={30} color="#3498DB" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#3498DB" />
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
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  arrow: {
    padding: 10,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#BDC3C7',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  dayContainer: {
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
  },
  day: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2C3E50',
  },
  date: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  slot: {
    backgroundColor: '#3498DB',
    padding: 10,
    marginVertical: 3,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BDC3C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
  },
  slotEmpty: {
    backgroundColor: '#BDC3C7',
  },
  slotHovered: {
    backgroundColor: '#2C3E50',
    color: '#FFFFFF',
  },
  slotText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default App;
