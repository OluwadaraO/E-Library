import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './AdminNotificationPage.css';

function AdminNotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:3000/admin/notifications`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                } else {
                    console.error('Failed to fetch notifications');
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        const socket = io('http://localhost:3000'); // WebSocket connection

        // Listen for new notifications
        socket.on('adminNotification', (notification) => {
            console.log('New admin notification received:', notification);
            setNotifications((prevNotifications) => [notification, ...prevNotifications]);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const toggleReadStatus = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/notifications/${id}/toggle-read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const updatedNotification = await response.json();
                // Update the notifications state
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.id === id ? { ...notif, read: updatedNotification.read } : notif
                    )
                );
            } else {
                console.error('Failed to toggle read status');
            }
        } catch (error) {
            console.error('Error toggling read status:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Remove the notification from the UI
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification.id !== notificationId)
            );
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleBackToHome = () => {
        navigate('/admin-home'); // Navigate back to the admin home page
    };

    if (loading) return <p>Loading notifications...</p>;

    return (
        <div>
            <h1>Admin Notifications</h1>
            <button onClick={handleBackToHome}>Back to Home Page</button>
            <ul>
                {notifications.map((notification) => (
                    <li key={notification.id}>
                        <p
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => toggleReadStatus(notification.id)}
                        >
                            {notification.message}
                        </p>
                        <button onClick={() => handleDeleteNotification(notification.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminNotificationPage;
