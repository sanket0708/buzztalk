import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({})

    const { socket, axios } = useContext(AuthContext);

    //fetch all users for sidebar

    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //get message 

    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);

            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //send message to user

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage])
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //new message in real time 
    const subscribeToMessages = async () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            console.log('New message received:', newMessage);
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => {
                    // Check if message already exists
                    const exists = prevMessages.some(msg => msg._id === newMessage._id);
                    if (exists) return prevMessages;
                    return [...prevMessages, newMessage];
                });
                // Mark message as seen
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(error => {
                    console.error('Error marking message as seen:', error);
                });
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: (prevUnseenMessages[newMessage.senderId] || 0) + 1
                }));
            }
        });

        // Listen for message seen status
        socket.on("messageSeen", ({ messageId }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg._id === messageId ? { ...msg, seen: true } : msg
                )
            );
        });
    }

    const unsubscribeFromMessages = async () => {
        if (socket) {
            socket.off("newMessage");
            socket.off("messageSeen");
        }
    }

    // Reconnect socket when selectedUser changes
    useEffect(() => {
        if (socket && selectedUser) {
            socket.emit("joinChat", selectedUser._id);
        }
        return () => {
            if (socket && selectedUser) {
                socket.emit("leaveChat", selectedUser._id);
            }
        };
    }, [socket, selectedUser]);

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser])


    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages

    }

    return (<ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>)
}