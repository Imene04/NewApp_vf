// Intégration de l'API pour récupérer les slots
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const App = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://ikalas.com/api/v1/ik-slots',
        { startDate: '2024-08-01', endDate: '2024-08-10' },
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
    fetchSlots();
  }, []);

  return (
    <View>
      <Text>Calendrier</Text>
    </View>
  );
};

export default App;
