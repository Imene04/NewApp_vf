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

    // Créer une liste de tous les créneaux horaires de 8h30 à 17h00 avec des espaces
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
    <TouchableOpacity style={[styles.slot, item.available ? styles.availableSlot : styles.unavailableSlot]}>
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
          style={styles.slotList}
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
        <TouchableOpacity onPress={handlePreviousWeek} disabled={isPreviousDisabled} style={[styles.arrow, isPreviousDisabled && styles.disabledArrow]}>
          <Icon name="arrow-back" size={30} color={isPreviousDisabled ? '#b0b0b0' : '#007bff'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextWeek} style={styles.arrow}>
          <Icon name="arrow-forward" size={30} color="#007bff" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
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
    backgroundColor: '#f5f5f5', // Couleur de fond gris clair
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dayColumn: {
    marginHorizontal: 5,
    alignItems: 'center',
    width: 150, // Fixer une largeur pour les colonnes de jours et les slots
  },
  dayContainer: {
    backgroundColor: '#ffffff', // Couleur de fond des jours
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 10,
  },
  day: {
    fontWeight: '600',
    fontSize: 18,
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  slotList: {
    width: '100%', // Assurer que la liste des créneaux horaires occupe toute la largeur de la colonne
  },
  slot: {
    borderRadius: 10,
    paddingVertical: 20, // Augmenter le padding vertical
    paddingHorizontal: 10, // Réduire le padding horizontal pour ajuster à la largeur
    marginVertical: 5,
    width: '100%', // Assurer que les slots prennent toute la largeur disponible
  },
  availableSlot: {
    backgroundColor: '#cce5ff', // Bleu clair pour les créneaux disponibles
  },
  unavailableSlot: {
    backgroundColor: '#e2e3e5', // Gris clair pour les créneaux non disponibles
  },
  slotText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
  },
  arrow: {
    padding: 10,
  },
  disabledArrow: {
    opacity: 0.5,
  },
});

export default App;
