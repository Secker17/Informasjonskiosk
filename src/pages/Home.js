import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';


<div className='App'></div>
const App = () => {
  const [weatherEmoji, setWeatherEmoji] = useState('☀️');
  const [time, setTime] = useState('');
  const [weatherForecast, setWeatherForecast] = useState('Værprognose...');

  // Function to fetch current weather and update the emoji
  const updateWeatherEmoji = async () => {
    const apiKey = 'c5af7312f91f4226a9881121231412';
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
          emoji = '🌈'; // Default emoji for unexpected conditions
      }

      setWeatherEmoji(emoji);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Function to update the clock
  const updateClock = () => {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    setTime(`${hours}:${minutes}`);
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

  // Use useEffect to call functions on component mount
    useEffect(() => {
      updateWeatherEmoji();
      updateWeatherForecast();
      const clockInterval = setInterval(updateClock, 1000);
      return () => clearInterval(clockInterval); // Clean up interval on component unmount
    }, []);



    return (
      <>
        <div className="footer-text">Secker design</div>
        <div className="box-left">
          <div className="box-left-text">{weatherEmoji}</div>
          <div className="additional-text">Asker</div>
        </div>
        <div className="box">
          <div className="box-text">{time || 'Laster...'}</div>
        </div>
        <div className="welcome">Velkommen</div>
        <div className="forecast-box">
          <div className="forecast-text" dangerouslySetInnerHTML={{ __html: weatherForecast }}></div>
        </div>
        <div className="button">
              <Link to='/login'>
                  <Button variant="primary">Login</Button>
              </Link>
          </div>
      </>
    );
    
  }




export default App;