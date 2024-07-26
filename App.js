import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import Icon from 'react-native-vector-icons/Ionicons'; // Importer les icônes

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

    // Créer une liste de tous les créneaux horaires de 8:30 à 17:00 avec des espaces
    const allSlots = [];
    let currentTime = day.startOf('day').hour(8).minute(30);
    const endTime = day.startOf('day').hour(17).minute(0);

    while (currentTime.isBefore(endTime)) {
      const nextTime = currentTime.add(30, 'minute');
      allSlots.push({
        start: currentTime,
        end: nextTime,
        available: daySlots.some(slot => dayjs(slot.start).isSame(currentTime) && dayjs(slot.end).isSame(nextTime)),
      });
      currentTime = nextTime;
    }

    // Limiter le nombre de créneaux horaires vides affichés
    const availableSlots = allSlots.filter(slot => slot.available);
    const emptySlots = allSlots.filter(slot => !slot.available).slice(0, Math.max(availableSlots.length / 2, 1));

    return [...availableSlots, ...emptySlots];
  };

  const renderSlot = ({ item }) => (
    <TouchableOpacity style={[styles.slot, !item.available && styles.emptySlot]}>
      <Text style={styles.slotText}>
        {item.available ? `${dayjs(item.start).format('HH:mm')} - ${dayjs(item.end).format('HH:mm')}` : '-'}
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
        <FlatList
          data={days}
          renderItem={({ item }) => renderDay(item)}
          keyExtractor={(item) => item.format('YYYY-MM-DD')}
          horizontal
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center', // Centrer horizontalement
    justifyContent: 'center', // Centrer verticalement
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Ajouté un espace en bas pour séparer du calendrier
    width: '100%', // S'assurer que le header prend toute la largeur disponible
  },
  dayColumn: {
    marginHorizontal: 10,
    alignItems: 'center', // Centrer horizontalement le jour et la date
  },
  dayContainer: {
    backgroundColor: '#e0e0e0', // Couleur de fond plus claire
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  day: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    fontSize: 14,
  },
  slot: {
    backgroundColor: '#d3d3d3', // Couleur des slots en gris clair
    padding: 10,
    marginVertical: 5,
    width: '100%', // Assurer que les slots prennent toute la largeur disponible
  },
  emptySlot: {
    backgroundColor: '#ffffff', // Arrière-plan blanc pour les créneaux horaires vides
  },
  slotText: {
    color: 'black',
    textAlign: 'center',
  },
  arrow: {
    padding: 10,
  },
  disabledArrow: {
    padding: 10,
    opacity: 0.5,
  },
});

export default App;
