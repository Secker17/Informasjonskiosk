import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { auth, firestore } from '../firebase'; // Adjust this path to your actual firebase.js path
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../admin.css'; // Når CSS-filen er i samme mappe som JSX-filen


const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Example check for an admin user
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsLoggedIn(true);
          const contentRef = doc(firestore, 'content', 'homePage');
          const contentSnap = await getDoc(contentRef);
          if (contentSnap.exists()) {
            setWelcomeMessage(contentSnap.data().welcomeMessage);
            setImages(contentSnap.data().images || []);
          }
        } else {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);

  const handleWelcomeMessageChange = (event) => {
    setWelcomeMessage(event.target.value);
  };

  const handleImageChange = (index, event) => {
    const newImages = [...images];
    newImages[index] = event.target.value;
    setImages(newImages);
  };

  const addImage = () => {
    setImages([...images, '']);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSave = async () => {
    try {
      const docRef = doc(firestore, 'content', 'homePage');
      await updateDoc(docRef, {
        welcomeMessage,
        images
      });
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div>Please log in to access the admin panel.</div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="form-group">
        <label htmlFor="welcomeMessage">Welcome Message:</label>
        <textarea id="welcomeMessage" value={welcomeMessage} onChange={handleWelcomeMessageChange} />
      </div>
      <div className="form-group">
        <label>Images:</label>
        {images.map((url, index) => (
          <div className="image-input" key={index}>
            <input
              type="text"
              value={url}
              onChange={(e) => handleImageChange(index, e)}
            />
            <Button variant="danger" onClick={() => removeImage(index)}>Remove</Button>
          </div>
        ))}
        <Button onClick={addImage}>Add Image</Button>
      </div>
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
};

export default AdminPanel;
