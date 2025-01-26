// AddPerson.js
import React, { useState } from 'react';
// import './Person.css';

const API_URL = 'https://f28c-2405-4802-2461-dd90-693a-874d-e37d-dc40.ngrok-free.app';
const AddPerson = () => {
    const [personData, setPersonData] = useState({
        name: '',
        image: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPersonData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleNameChange = (e) => {
        setPersonData(prev => ({
            ...prev,
            name: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!personData.name.trim() || !personData.image) {
            setMessage({ text: 'Please provide both name and image', type: 'error' });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', personData.name);
        formData.append('image', personData.image);

        try {
            const response = await fetch(`${API_URL}/add_person`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Person added successfully!', type: 'success' });
                // Reset form
                setPersonData({
                    name: '',
                    image: null
                });
                e.target.reset();
            } else {
                setMessage({ text: data.detail || 'Error adding person', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="person-form-container">
            <h2>Add New Person</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Person Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={personData.name}
                        onChange={handleNameChange}
                        placeholder="Enter person's name"
                        required
                        className="input-field"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image">Select Face Image:</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className="input-field"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading || !personData.name || !personData.image}
                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                >
                    {isLoading ? 'Adding...' : 'Add Person'}
                </button>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddPerson;