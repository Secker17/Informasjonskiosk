import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { firestore } from '../firebase'; // Ensure this path is correct for your project setup
import { doc, onSnapshot } from 'firebase/firestore';
import '../App.css'; // Ensure this path is correct for your project setup

const Home = () => {
  const [weatherEmoji, setWeatherEmoji] = useState('☀️');
  const [time, setTime] = useState('');
  const [weatherForecast, setWeatherForecast] = useState('Værprognose...');
  const [welcomeMessage, setWelcomeMessage] = useState('Velkommen');
  const [currentImage, setCurrentImage] = useState('');
  const [images, setImages] = useState([]);

  // Update the clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    const intervalId = setInterval(updateClock, 1000);
    updateClock(); // Initialize the clock immediately

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  // Listen for changes to the homePage document in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, "content", "homePage"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setWelcomeMessage(data.welcomeMessage);
        setImages(data.images || []);
        setCurrentImage(data.images[0] || ''); // Set to the first image by default
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe(); // Clean up on component unmount
  }, []);

  // Cycle through the images every 5 seconds
  useEffect(() => {
    if (images.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentImage((current) => {
          const currentIndex = images.indexOf(current);
          const nextIndex = (currentIndex + 1) % images.length;
          return images[nextIndex];
        });
      }, 5000);

      return () => clearInterval(intervalId); // Clean up on component unmount
    }
  }, [images]);

  

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

  useEffect(() => {
    updateWeatherEmoji(); // Call it to initialize the emoji
    updateWeatherForecast(); // Call it to initialize the forecast
  }, []);
 
  return (
    <div className='App'>
      <div className="large-image-container">
        <img src={currentImage} alt="Current Display" className="large-image"/>
      </div>
      <div className="footer-text">Secker design</div>
      <div className="box-left">
        <div className="box-left-text">{weatherEmoji}</div>
        <div className="additional-text">Asker</div>
      </div>
      <div className="box">
        <div className="box-text">{time || 'Loading...'}</div>
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
          <Button variant="outline-success">Sign Up</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;