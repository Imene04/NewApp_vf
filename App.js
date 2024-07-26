// Ajout de la navigation et des flèches pour changer de semaine
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

  return (
    <View>
      <View>
        <TouchableOpacity onPress={handlePreviousWeek}>
          <Icon name="arrow-back" size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextWeek}>
          <Icon name="arrow-forward" size={30} />
        </TouchableOpacity>
      </View>
      <Text>Calendrier</Text>
    </View>
  );
};

export default App;
