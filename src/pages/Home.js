// Importing necessary React hooks and components, as well as other libraries and styles.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Used for navigation without page reloads
import { Button } from 'react-bootstrap'; // A styled button component from React Bootstrap
import { firestore } from '../firebase'; // Importing the Firestore instance from your Firebase configuration
import { doc, getDoc, onSnapshot } from 'firebase/firestore'; // Firestore methods to fetch document data
import '../App.css'; // Importing stylesheet for styling

// Defining the Home functional component
const Home = () => {
  // State variables to hold dynamic data in the component
  const [weatherEmoji, setWeatherEmoji] = useState('☀️'); // State for current weather emoji
  const [time, setTime] = useState(''); // State for current time
  const [weatherForecast, setWeatherForecast] = useState('Værprognose...'); // State for weather forecast HTML content
  const [welcomeMessage, setWelcomeMessage] = useState('Velkommen'); // State for welcome message, fetched from Firestore

  const welcomesub = onSnapshot (doc(firestore, "content", "homePage"), doc => {
    setWelcomeMessage (doc.data().welcomeMessage)
  })

  // Function to update the current time every second
  const updateClock = () => {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0'); // Format hours to 2 digits
    let minutes = now.getMinutes().toString().padStart(2, '0'); // Format minutes to 2 digits
    setTime(`${hours}:${minutes}`); // Set the formatted time to state
  };

  // Async function to fetch current weather data and update the weather emoji based on the condition
  const updateWeatherEmoji = async () => {
    const apiKey = 'c5af7312f91f4226a9881121231412'; // Your weather API key
    const city = 'asker,norway'; // The city for which to fetch weather
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`; // API endpoint with query parameters

    try {
      const response = await fetch(url); // Fetching weather data from the API
      const data = await response.json(); // Parsing the JSON response
      const weatherCondition = data.current.condition.text; // Extracting the weather condition

      // Determining the appropriate emoji based on the weather condition
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
          emoji = '?'; // Default emoji for unexpected conditions
      }

      setWeatherEmoji(emoji); // Update state with the selected emoji
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Async function to fetch the weather forecast and update the state with HTML content
  const updateWeatherForecast = async () => {
  const apiKey = 'c5af7312f91f4226a9881121231412';
  const city = 'asker,norway';
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;

  try {
    const response = await fetch(url); // Fetching weather forecast data
    const data = await response.json(); // Parsing the JSON response
    let forecastHtml = ''; // Initialize an empty string to build HTML content
    // Looping through each forecast day and building HTML content
    data.forecast.forecastday.forEach(day => {
      forecastHtml += `<div class="forecast-day">${day.date}:  Høy: ${day.day.maxtemp_c}°C, Lav: ${day.day.mintemp_c}°C</div>`;
    });

      setWeatherForecast(forecastHtml); // Updating state with the HTML content
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
    }
  };

  // Fetching editable content from Firestore on component mount
  useEffect(() => {
    const fetchEditableContent = async () => {
      try {
        const docRef = doc(firestore, 'editableContent', 'homePage'); // Reference to a specific document in Firestore
        const docSnap = await getDoc(docRef); // Fetching the document

        if (docSnap.exists()) {
          setWelcomeMessage(docSnap.data().welcomeMessage); // Update state if the document exists
        } else {
          console.log("No editable content document found!");
        }
      } catch (error) {
        console.error("Error fetching editable content:", error);
      }
    };

    // Calling the functions to update weather and time initially and setting an interval for the clock
    fetchEditableContent();
    updateWeatherEmoji();
    updateWeatherForecast();
    const clockInterval = setInterval(updateClock, 1000); // Update time every second

    return () => clearInterval(clockInterval); // Clean up the interval when component unmounts
  }, []); // Empty dependency array means this effect runs once on mount

  // JSX to render the component UI
  return (
    <div className='App'>
      {/* Footer text */}
      <div className="footer-text">Secker design</div>
      {/* Box for weather emoji and location */}
      <div className="box-left">
        <div className="box-left-text">{weatherEmoji}</div>
        <div className="additional-text">Asker</div>
      </div>
      {/* Box for displaying time */}
      <div className="box">
        <div className="box-text">{time || 'Laster...'}</div>
      </div>
      {/* Displaying welcome message */}
      <div className="welcome">{welcomeMessage}</div>
      {/* Box for displaying weather forecast. Using dangerouslySetInnerHTML for HTML content */}
      <div className="forecast-box">
        <div className="forecast-text" dangerouslySetInnerHTML={{ __html: weatherForecast }}></div>
      </div>
      {/* Button to navigate to the login page */}
      <div className="button">
        <Link to='/login'>
          <Button variant="primary">Login</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home; // Exporting the Home component for use in other parts of the app
