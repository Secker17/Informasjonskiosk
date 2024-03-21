import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { firestore } from '../firebase'; // Adjust this path to your actual firebase.js path
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import '../App.css'; // Adjust this path to your actual CSS file

const Home = () => {
  const [weatherEmoji, setWeatherEmoji] = useState('☀️');
  const [time, setTime] = useState('');
  const [weatherForecast, setWeatherForecast] = useState('Værprognose...');
  const [welcomeMessage, setWelcomeMessage] = useState('Velkommen'); // Default message
  const [currentImage, setCurrentImage] = useState('mo.png');
  const images = ['mo.png', 'per.JPG'];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImage((current) => (current === images[0] ? images[1] : images[0]));
    }, 5000); // Bytt bilde hvert 5. sekund

    return () => clearInterval(intervalId); // Rens opp intervallet når komponenten avmonteres
  }, []);


  const welcomesub = onSnapshot (doc(firestore, "content", "homePage"), doc => {
    setWelcomeMessage (doc.data().welcomeMessage)
  })

  // Function to update the clock
  const updateClock = () => {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    setTime(`${hours}:${minutes}`);
  };

  // Function to fetch current weather and update the emoji
  const updateWeatherEmoji = async () => {
    const apiKey = 'c5af7312f91f4226a9881121231412'; // Replace with your API key
    const city = 'asker,norway';
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const weatherCondition = data.current.condition.text;

      let emoji;
      switch (weatherCondition) {
        case 'Sunny':
        case 'Clear':
          emoji = '☀️';
          break;
        case 'Partly cloudy':
        case 'Cloudy':
          emoji = '⛅';
          break;
        case 'Overcast':
          emoji = '☁️';
          break;
        case 'Rain':
          emoji = '🌧️';
          break;
        case 'Snow':
          emoji = '❄️';
          break;
        default:
          emoji = 'IDK'; // Default emoji for unexpected conditions
      }

      setWeatherEmoji(emoji);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Function to fetch and update the weather forecast
  const updateWeatherForecast = async () => {
    const apiKey = 'c5af7312f91f4226a9881121231412';
    const city = 'asker,norway';
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;
 
 

    try {
      const response = await fetch(url);
      const data = await response.json();
      let forecastHtml = '';
      data.forecast.forecastday.forEach(day => {
        forecastHtml += `<div class="forecast-day">${day.date}:  Høy: ${day.day.maxtemp_c}°C, Lav: ${day.day.mintemp_c}°C</div>`;
      });

      setWeatherForecast(forecastHtml);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
    }
  };

  // Fetch editable content from Firestore
  useEffect(() => {
    const fetchEditableContent = async () => {
      try {
        const docRef = doc(firestore, 'editableContent', 'homePage');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setWelcomeMessage(docSnap.data().welcomeMessage); 
        } else {
          console.log("No editable content document found!");
        }
      } catch (error) {
        console.error("Error fetching editable content:", error);
      }
    };

    fetchEditableContent();
    updateWeatherEmoji();
    updateWeatherForecast();
    const clockInterval = setInterval(updateClock, 1000);

    return () => clearInterval(clockInterval); // Clean up interval on component unmount
  }, []);

  return (
<div className='App'>
      <div className="large-image-container">
        <img src={currentImage} alt="Descriptive Alt Text" className="large-image"/>
      </div>
      <div className="footer-text">Secker design</div>
      <div className="box-left">
        <div className="box-left-text">{weatherEmoji}</div>
        <div className="additional-text">Asker</div>
      </div>
      <div className="box">
        <div className="box-text">{time || 'Laster...'}</div>
      </div>
      <div className="welcome">{welcomeMessage}</div>
      <div className="forecast-box">
        <div className="forecast-text" dangerouslySetInnerHTML={{ __html: weatherForecast }}></div>
      </div>
      <div className="button-container">
        <Link to='/login'>
          <Button variant="outline-primary">Login</Button>
        </Link>
        <Link to='/signup'>
          <Button variant="outline-success">Sign In</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
