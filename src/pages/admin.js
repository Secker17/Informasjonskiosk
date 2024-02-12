import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { auth, firestore } from '../firebase'; // Adjust this path to your actual firebase.js path
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import '../admin.css'; // Adjust this path to your actual CSS file

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(''); // State for the username
  const [welcomeMessage, setWelcomeMessage] = useState(''); // State for the welcome message
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists() && docSnap.data().role === 'admin') {
            setUserRole(docSnap.data().role);
            setUsername(docSnap.data().name); // Her setter du brukernavnet fra Firestore
          } else {
            console.log("No such document or not an admin!");
            navigate('/login'); // Redirect if not admin
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        navigate('/login');
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  

  // Fetching editable content for the admin to edit
  useEffect(() => {
    const fetchEditableContent = async () => {
      try {
        const docRef = doc(firestore, 'content', 'homePage'); // Adjust this path to your actual content document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setWelcomeMessage(docSnap.data().welcomeMessage); // Adjust this to match your field
        } else {
          console.log("No editable content document found!");
        }
      } catch (error) {
        console.error("Error fetching editable content:", error);
      }
    };

    if (isLoggedIn && userRole === 'admin') {
      fetchEditableContent();
    }
  }, [isLoggedIn, userRole]);

  const handleWelcomeMessageChange = (event) => {
    setWelcomeMessage(event.target.value);
  };

  const handleSave = async () => {
    try {
      const docRef = doc(firestore, 'content', 'homePage'); // Adjust this to your actual content document
      await updateDoc(docRef, {
        welcomeMessage: welcomeMessage // Adjust this to match your field
      });
      // Add success/notification logic here if needed
    } catch (error) {
      console.error('Error updating content:', error);
      // Add error/notification logic here if needed
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setIsLoggedIn(false);
      setUsername(''); // Clear username on logout
      navigate('/login');
    }).catch((error) => {
      console.error('Logout Error:', error);
    });
  };

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Admin Panel</h1>
        <p>You are not logged in. Please log in to access the admin panel.</p>
        <Button variant="primary" onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h1>SECKER ADMIN</h1>
        <p>Welcome, {username}!</p> {/* Display the username here */}
        <nav className="menu">
          <a href="#">Dashboard</a>
          <a href="#" className="active">Edit Home</a>
          {/* Other navigation links */}
        </nav>
      </aside>
      <main className="main-content">
        <header className="header">
          <input type="search" placeholder="Search for..."></input>
          <button onClick={handleLogout}>Logout</button>
        </header>

        <div>
          <h2>Edit Welcome</h2>
          <div>
            <label htmlFor="welcomeMessage">Welcome Message:</label>
            <textarea id="welcomeMessage" value={welcomeMessage} onChange={handleWelcomeMessageChange}></textarea>
          </div>
          <button onClick={handleSave}>Save Changes</button>
        </div>
        
        <footer className="footer">
          <p>Copyright © Secker Consulting 2023</p>
        </footer>
      </main>
    </div>
  );
};

export default AdminPanel;
