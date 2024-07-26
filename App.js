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

  const renderSlot = ({ item }) => (
    <TouchableOpacity style={styles.slot}>
      <Text style={styles.slotText}>{`${dayjs(item.start).format('HH:mm')} - ${dayjs(item.end).format('HH:mm')}`}</Text>
    </TouchableOpacity>
  );

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
          renderItem={({ item }) => (
            <View style={styles.dayColumn}>
              <View style={styles.dayContainer}>
                <Text style={styles.day}>{item.format('dddd')}</Text>
                <Text style={styles.date}>{item.format('DD MMM YYYY')}</Text>
              </View>
              <FlatList
                data={Array.isArray(slots) ? slots.filter(slot => dayjs(slot.start).isSame(item, 'day')) : []}
                renderItem={renderSlot}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          )}
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
    backgroundColor: '#f0f0f0',
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
    backgroundColor: 'black',
    padding: 10,
    marginVertical: 5,
  },
  slotText: {
    color: 'white',
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
