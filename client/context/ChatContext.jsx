import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { socket, axios } = useContext(AuthContext);

    const getUsers = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getMessages = async (userId) => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (messageData) => {
        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }

        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
                // Emit message sent event
                if (socket) {
                    socket.emit("messageSent", {
                        messageId: data.newMessage._id,
                        receiverId: selectedUser._id
                    });
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const subscribeToMessages = () => {
        if (!socket) return;

        // Clean up any existing listeners
        socket.off("newMessage");
        socket.off("messageSeen");

        socket.on("newMessage", (newMessage) => {
            console.log("New message received:", newMessage);
            
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                setMessages((prevMessages) => {
                    // Check for duplicate messages
                    if (prevMessages.some(msg => msg._id === newMessage._id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, { ...newMessage, seen: true }];
                });

                // Mark message as seen
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(error => {
                    console.error("Error marking message as seen:", error);
                });
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
                }));
            }
        });

        socket.on("messageSeen", ({ messageId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId ? { ...msg, seen: true } : msg
                )
            );
        });
    };

    // Handle user selection
    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
            // Join chat room
            if (socket) {
                socket.emit("joinChat", selectedUser._id);
            }
        }
        return () => {
            if (selectedUser && socket) {
                socket.emit("leaveChat", selectedUser._id);
            }
        };
    }, [selectedUser, socket]);

    // Subscribe to messages when socket is available
    useEffect(() => {
        subscribeToMessages();
        return () => {
            if (socket) {
                socket.off("newMessage");
                socket.off("messageSeen");
            }
        };
    }, [socket, selectedUser]);

    // Initial users fetch
    useEffect(() => {
        getUsers();
    }, []);

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
        setUnseenMessages,
        isLoading
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};