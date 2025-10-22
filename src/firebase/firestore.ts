import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  startAfter,
  increment,
  onSnapshot,
} from "firebase/firestore";
// Removed realtime import - all features now use Firestore
import { db } from "./config";

// Realtime Features Types (migrated from Realtime Database)
export interface TypingIndicator {
  isTyping: boolean;
  timestamp: number;
  userId: string;
  userName: string;
}

export interface PresenceStatus {
  status: "online" | "offline" | "away";
  lastSeen: number;
  userId: string;
  userName: string;
}

export interface LiveNotification {
  id: string;
  type: "message" | "connection_request" | "system";
  title: string;
  message: string;
  userId: string;
  roomId?: string; // Optional field - only present for message notifications
  timestamp: number;
  read: boolean;
}

// Port Detection System Interfaces
export interface ShipSearch {
  id?: string;
  searcherUserId: string;
  searcherShipId: string;
  targetShipId: string;
  searchDate: string; // YYYY-MM-DD format
  timestamp: number;
}

export interface PortLink {
  id?: string;
  shipAId: string;
  shipBId: string;
  shipAName?: string;
  shipBName?: string;
  linkDate: string; // YYYY-MM-DD
  createdAt: number;
  expiresAt: number; // End of day timestamp
  searchCount: {
    shipA: number; // Users from Ship A who searched Ship B
    shipB: number; // Users from Ship B who searched Ship A
  };
  isActive: boolean;
}

// Types
export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any;
  unreadCounts: { [userId: string]: number };
  createdAt: any;
  updatedAt: any;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: "text" | "image" | "file";
  fileUrl?: string;
  isRead: boolean;
  createdAt: any;
}

export interface Connection {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: any;
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  message?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: any;
}

// Chat functions
// getChatRooms function moved to end of file

export const getChatMessages = async (
  roomId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
  try {
    let messagesQuery = query(
      collection(db, "chatMessages"),
      where("roomId", "==", roomId),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (page > 1) {
      // For pagination, you'd need to implement cursor-based pagination
      // This is a simplified version
      const offset = (page - 1) * pageSize;
      messagesQuery = query(
        collection(db, "chatMessages"),
        where("roomId", "==", roomId),
        orderBy("createdAt", "desc"),
        limit(offset + pageSize)
      );
    }

    const snapshot = await getDocs(messagesQuery);
    const messages = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ChatMessage)
    );

    return {
      messages: messages.slice(0, pageSize),
      hasMore: messages.length > pageSize,
    };
  } catch (error) {
    throw error;
  }
};

export const sendChatMessage = async (
  roomId: string,
  senderId: string,
  content: string,
  messageType: "text" | "image" | "file" = "text",
  fileUrl?: string
): Promise<string> => {
  try {
    // Add message to chatMessages collection
    const messageData = {
      roomId,
      senderId,
      content,
      messageType,
      fileUrl: fileUrl || null,
      isRead: false,
      createdAt: serverTimestamp(),
    };

    const messageRef = await addDoc(
      collection(db, "chatMessages"),
      messageData
    );

    // Update chat room with last message
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, {
      lastMessage: content,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return messageRef.id;
  } catch (error) {
    throw error;
  }
};

export const createChatRoom = async (
  participants: string[]
): Promise<string> => {
  try {
    const roomData = {
      participants,
      lastMessage: null,
      lastMessageAt: null,
      unreadCounts: participants.reduce((acc, userId) => {
        acc[userId] = 0;
        return acc;
      }, {} as { [userId: string]: number }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const roomRef = await addDoc(collection(db, "chatRooms"), roomData);
    return roomRef.id;
  } catch (error) {
    throw error;
  }
};

// Connection functions
export const getConnections = async (userId: string): Promise<Connection[]> => {
  try {
    const connectionsQuery1 = query(
      collection(db, "connections"),
      where("user1Id", "==", userId)
    );

    const connectionsQuery2 = query(
      collection(db, "connections"),
      where("user2Id", "==", userId)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(connectionsQuery1),
      getDocs(connectionsQuery2),
    ]);

    const connections = [
      ...snapshot1.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Connection)
      ),
      ...snapshot2.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Connection)
      ),
    ];

    return connections;
  } catch (error) {
    throw error;
  }
};

export const sendConnectionRequest = async (
  requesterId: string,
  receiverId: string,
  message?: string
): Promise<string> => {
  try {
    console.log("🔗 sendConnectionRequest called with:", {
      requesterId,
      receiverId,
      message,
    });

    const requestData = {
      requesterId,
      receiverId,
      status: "pending",
      message: message || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const requestRef = await addDoc(
      collection(db, "connectionRequests"),
      requestData
    );

    // Send live notification (no need for legacy notification as well)
    try {
      console.log(
        "📤 Sending live notification to user:",
        receiverId,
        "with message:",
        message || "Someone wants to connect with you!"
      );
      const notification = await sendLiveNotification(
        receiverId,
        "connection_request",
        "New Connection Request",
        message || "Someone wants to connect with you!"
      );
      console.log("✅ Live notification sent successfully:", notification.id);
    } catch (error) {
      console.error("❌ Error sending live notification:", error);
    }

    return requestRef.id;
  } catch (error) {
    console.error("Error creating connection request:", error);
    throw error;
  }
};

// Get user's connections
export const getUserConnections = async (userId: string): Promise<any[]> => {
  try {
    const connectionsRef = collection(db, "connections");
    const q = query(connectionsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching user connections:", error);
    throw error;
  }
};

// Get pending connection requests for a user
export const getPendingConnectionRequests = async (
  userId: string
): Promise<any[]> => {
  try {
    const requestsRef = collection(db, "connectionRequests");
    const q = query(
      requestsRef,
      where("requesterId", "==", userId),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching pending connection requests:", error);
    throw error;
  }
};

// Create a notification for a user
export const createNotification = async (notificationData: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead?: boolean;
}): Promise<string> => {
  try {
    const notificationRef = await addDoc(collection(db, "notifications"), {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      isRead: notificationData.isRead || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return notificationRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Create a missing item report
export const createMissingReport = async (reportData: {
  type: string;
  name: string;
  description: string;
}): Promise<string> => {
  try {
    const reportRef = await addDoc(collection(db, "reports"), {
      type: "missing_item",
      category: reportData.type,
      name: reportData.name,
      description: reportData.description,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return reportRef.id;
  } catch (error) {
    console.error("Error creating missing report:", error);
    throw error;
  }
};

export const respondToConnectionRequest = async (
  requestId: string,
  status: "accepted" | "declined"
): Promise<void> => {
  try {
    const requestRef = doc(db, "connectionRequests", requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    if (status === "accepted") {
      // Get the request to create connection
      const requestDoc = await getDoc(requestRef);
      if (requestDoc.exists()) {
        const requestData = requestDoc.data();
        const { requesterId, receiverId } = requestData;

        // Create connections for both users
        const connectionsRef = collection(db, "connections");

        // Create connection for requester
        await addDoc(connectionsRef, {
          userId: requesterId,
          connectedUserId: receiverId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Create connection for receiver
        await addDoc(connectionsRef, {
          userId: receiverId,
          connectedUserId: requesterId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Create notification for the requester
        await createNotification({
          userId: requesterId,
          type: "connection_accepted",
          title: "Connection Request Accepted",
          message: "Your connection request has been accepted!",
          data: {
            receiverId,
            requestId,
          },
          isRead: false,
        });

        // Automatically create a chat room for the connected users
        try {
          const chatRoomId = await createOrGetChatRoom(requesterId, receiverId);
          console.log("Chat room created automatically:", chatRoomId);
        } catch (chatError) {
          console.error("Error creating chat room:", chatError);
          // Don't throw error here as connection is already successful
        }

        // Check if this new connection triggers a port link
        try {
          await checkPortLinksOnConnection(requesterId, receiverId);
        } catch (portLinkError) {
          console.error(
            "Error checking port links on connection:",
            portLinkError
          );
          // Don't throw error here as connection is already successful
        }
      }
    } else {
      // Create notification for declined request
      const requestDoc = await getDoc(requestRef);
      if (requestDoc.exists()) {
        const { requesterId } = requestDoc.data();

        await createNotification({
          userId: requesterId,
          type: "connection_declined",
          title: "Connection Request Declined",
          message: "Your connection request was declined.",
          data: {
            requestId,
          },
          isRead: false,
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

// Get connection requests received by a user
export const getReceivedConnectionRequests = async (
  userId: string
): Promise<any[]> => {
  try {
    const requestsRef = collection(db, "connectionRequests");
    const q = query(
      requestsRef,
      where("receiverId", "==", userId),
      where("status", "==", "pending")
      // Temporarily removed orderBy to avoid index requirement while building
    );
    const snapshot = await getDocs(q);

    // Get basic request data
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Helper functions to get names
    const getDepartmentName = async (departmentId: string) => {
      try {
        const departmentDoc = await getDoc(
          doc(db, "departments", departmentId)
        );
        return departmentDoc.exists()
          ? departmentDoc.data().name
          : "Unknown Department";
      } catch (error) {
        console.error("Error fetching department name:", error);
        return "Unknown Department";
      }
    };

    const getRoleName = async (roleId: string) => {
      try {
        const roleDoc = await getDoc(doc(db, "roles", roleId));
        return roleDoc.exists() ? roleDoc.data().name : "Unknown Role";
      } catch (error) {
        console.error("Error fetching role name:", error);
        return "Unknown Role";
      }
    };

    // Fetch requester profiles for each request
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        try {
          const requesterProfile = (await getUserProfile(
            request.requesterId
          )) as any;

          // Get ship and cruise line information
          let shipName = "Not specified";
          let cruiseLineName = "Not specified";

          if (requesterProfile.currentShipId) {
            try {
              const shipDoc = await getDoc(
                doc(db, "ships", requesterProfile.currentShipId)
              );
              if (shipDoc.exists()) {
                const shipData = shipDoc.data();
                shipName = shipData.name;

                // Get cruise line from ship
                if (shipData.cruiseLineId) {
                  const cruiseLineDoc = await getDoc(
                    doc(db, "cruiseLines", shipData.cruiseLineId)
                  );
                  if (cruiseLineDoc.exists()) {
                    cruiseLineName = cruiseLineDoc.data().name;
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching ship/cruise line data:", error);
            }
          }
          return {
            ...request,
            requesterName: requesterProfile.displayName,
            requesterPhoto: requesterProfile.profilePhoto,
            shipName,
            isOnline: requesterProfile.isOnline || false,
            cruiseLineName,
            departmentName: requesterProfile.departmentId
              ? await getDepartmentName(requesterProfile.departmentId)
              : "Not specified",
            roleName: requesterProfile.roleId
              ? await getRoleName(requesterProfile.roleId)
              : "Not specified",
          };
        } catch (error) {
          console.error(
            `Error fetching profile for ${request.requesterId}:`,
            error
          );
          return {
            ...request,
            requesterName: "Unknown User",
            requesterPhoto: null,
            shipName: "Not specified",
            cruiseLineName: "Not specified",
            departmentName: "Not specified",
            roleName: "Not specified",
          };
        }
      })
    );

    // Sort by createdAt descending in memory
    return requestsWithProfiles.sort((a, b) => {
      const aTime = (a as any).createdAt?.seconds || 0;
      const bTime = (b as any).createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("Error fetching received connection requests:", error);
    throw error;
  }
};

// Notification functions
export const getNotifications = async (
  userId: string
): Promise<Notification[]> => {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Notification)
    );
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const savePushToken = async (
  userId: string,
  token: string,
  platform?: string
): Promise<void> => {
  try {
    const tokenRef = doc(db, "pushTokens", token);
    await setDoc(
      tokenRef,
      {
        userId,
        token,
        platform: platform || "native",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving push token:", error);
    throw error;
  }
};

// User Profile Functions

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
  try {
    console.log("🔍 Fetching user profile for userId:", userId);
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("✅ User profile found:", { id: userDoc.id, ...userData });
      return { id: userDoc.id, ...userData };
    }
    console.log("❌ User profile not found for userId:", userId);
    throw new Error("User profile not found");
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    // Provide more specific error information
    if (error.code) {
      console.error("Firebase error code:", error.code);
    }
    if (error.message) {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

// Create user profile (id is the auth uid)
export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    console.log(
      "🔍 Creating user profile for userId:",
      userId,
      "with data:",
      profileData
    );
    const userRef = doc(db, "users", userId);

    // Remove undefined/null/empty string values to avoid Firestore errors
    const cleanData = Object.fromEntries(
      Object.entries(profileData || {}).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ""
      )
    );

    const dataToWrite = {
      ...cleanData,
      isActive: cleanData.isActive ?? true,
      isAdmin: cleanData.isAdmin ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("📝 Writing user profile data:", dataToWrite);
    await setDoc(userRef, dataToWrite);
    console.log("✅ User profile created successfully");
    return { id: userId, ...dataToWrite };
  } catch (error: any) {
    console.error("❌ Error creating user profile:", error);
    // Provide more specific error information
    if (error.code) {
      console.error("Firebase error code:", error.code);
    }
    if (error.message) {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

// Update user profile (partial updates)
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const userRef = doc(db, "users", userId);

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates || {}).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ""
      )
    );

    await updateDoc(userRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Subscribe to notifications for a user (real-time listener)
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: any[]) => void
) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// Chat and Messaging Functions

// Create or get existing chat room between two users
export const createOrGetChatRoom = async (
  userId1: string,
  userId2: string
): Promise<string> => {
  try {
    // Check if chat room already exists
    const chatRoomsRef = collection(db, "chatRooms");
    const q = query(
      chatRoomsRef,
      where("participants", "array-contains", userId1)
    );

    const snapshot = await getDocs(q);
    const existingRoom = snapshot.docs.find((doc) => {
      const data = doc.data();
      return data.participants.includes(userId2);
    });

    if (existingRoom) {
      return existingRoom.id;
    }

    // Create new chat room
    const newRoomData = {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
    };

    const roomRef = await addDoc(collection(db, "chatRooms"), newRoomData);
    return roomRef.id;
  } catch (error) {
    console.error("Error creating/getting chat room:", error);
    throw error;
  }
};

// Clean up duplicate chat rooms for a user
export const cleanupDuplicateChatRooms = async (
  userId: string
): Promise<void> => {
  try {
    const chatRoomsRef = collection(db, "chatRooms");
    const q = query(
      chatRoomsRef,
      where("participants", "array-contains", userId)
    );

    const snapshot = await getDocs(q);
    const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Group rooms by participant pairs
    const roomGroups = new Map<string, any[]>();

    rooms.forEach((room: any) => {
      const participants = room.participants.sort();
      const key = participants.join("_");

      if (!roomGroups.has(key)) {
        roomGroups.set(key, []);
      }
      roomGroups.get(key)!.push(room);
    });

    // Remove duplicates, keeping the oldest room
    for (const [_key, roomList] of roomGroups) {
      if (roomList.length > 1) {
        // Sort by creation date, keep the oldest
        roomList.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return aTime.getTime() - bTime.getTime();
        });

        // Delete all but the first (oldest) room
        const roomsToDelete = roomList.slice(1);
        for (const room of roomsToDelete) {
          await deleteDoc(doc(db, "chatRooms", room.id));
          console.log(`Deleted duplicate chat room: ${room.id}`);
        }
      }
    }
  } catch (error) {
    console.error("Error cleaning up duplicate chat rooms:", error);
    throw error;
  }
};

// Clean up stale presence data (users who haven't been seen for more than 10 minutes)
export const cleanupStalePresence = async (): Promise<void> => {
  try {
    const presenceRef = collection(db, "presence");
    const snapshot = await getDocs(presenceRef);
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const stalePresence = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.lastSeen && data.lastSeen < tenMinutesAgo;
    });

    for (const docSnapshot of stalePresence) {
      await deleteDoc(docSnapshot.ref);
      console.log(`Cleaned up stale presence for user: ${docSnapshot.id}`);
    }
  } catch (error) {
    console.error("Error cleaning up stale presence:", error);
    throw error;
  }
};

// Get chat rooms for a user
export const subscribeToChatRooms = (
  userId: string,
  callback: (rooms: any[]) => void
) => {
  try {
    console.log("💬 Setting up chat rooms subscription for user:", userId);
    const chatRoomsRef = collection(db, "chatRooms");
    const q = query(
      chatRoomsRef,
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        console.log(
          "📥 Chat rooms snapshot received:",
          snapshot.docs.length,
          "rooms"
        );
        const rooms = [];

        for (const doc of snapshot.docs) {
          const roomData = doc.data();
          const otherUserId = roomData.participants.find(
            (id: string) => id !== userId
          );

          if (otherUserId) {
            try {
              const otherUserProfile = (await getUserProfile(
                otherUserId
              )) as any;
              rooms.push({
                id: doc.id,
                ...roomData,
                otherUserId,
                unreadCount: roomData.unreadCounts?.[userId] || 0,
                otherUserProfile: {
                  displayName: otherUserProfile.displayName,
                  profilePhoto: otherUserProfile.profilePhoto,
                  currentShipId: otherUserProfile.currentShipId,
                  departmentId: otherUserProfile.departmentId,
                  roleId: otherUserProfile.roleId,
                },
              });
            } catch (error) {
              console.error(
                `Error fetching profile for user ${otherUserId}:`,
                error
              );
              // Add room with minimal data if profile fetch fails
              rooms.push({
                id: doc.id,
                ...roomData,
                otherUserId,
                unreadCount: roomData.unreadCounts?.[userId] || 0,
                otherUserProfile: {
                  displayName: "Unknown User",
                  profilePhoto: null,
                  currentShipId: null,
                  departmentId: null,
                  roleId: null,
                },
              });
            }
          }
        }

        console.log(
          "📥 Calling chat rooms callback with",
          rooms.length,
          "rooms"
        );
        callback(rooms);
      },
      (error) => {
        console.error("❌ Chat rooms subscription error:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up chat rooms subscription:", error);
    return () => {};
  }
};

export const getChatRooms = async (userId: string): Promise<any[]> => {
  try {
    const chatRoomsRef = collection(db, "chatRooms");
    const q = query(
      chatRoomsRef,
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    const rooms = [];

    for (const doc of snapshot.docs) {
      const roomData = doc.data();
      const otherUserId = roomData.participants.find(
        (id: string) => id !== userId
      );

      if (otherUserId) {
        try {
          const otherUserProfile = (await getUserProfile(otherUserId)) as any;
          console.log("getChatRooms - otherUserProfile:", {
            otherUserId,
            otherUserProfile,
            currentShipId: otherUserProfile?.currentShipId,
            departmentId: otherUserProfile?.departmentId,
            roleId: otherUserProfile?.roleId,
          });
          console.log("getChatRooms - roomData:", {
            roomId: doc.id,
            unreadCounts: roomData.unreadCounts,
            userId,
            extractedUnreadCount: roomData.unreadCounts?.[userId] || 0,
          });
          rooms.push({
            id: doc.id,
            ...roomData,
            otherUserId,
            unreadCount: roomData.unreadCounts?.[userId] || 0,
            otherUserProfile: {
              displayName: otherUserProfile.displayName,
              profilePhoto: otherUserProfile.profilePhoto,
              currentShipId: otherUserProfile.currentShipId,
              departmentId: otherUserProfile.departmentId,
              roleId: otherUserProfile.roleId,
              isOnline: otherUserProfile.isOnline,
            },
          });
        } catch (error) {
          console.error(
            `Error fetching profile for user ${otherUserId}:`,
            error
          );
          // Add room with minimal data if profile fetch fails
          rooms.push({
            id: doc.id,
            ...roomData,
            otherUserId,
            unreadCount: roomData.unreadCounts?.[userId] || 0,
            otherUserProfile: {
              displayName: "Unknown User",
              profilePhoto: null,
              currentShipId: null,
              departmentId: null,
              roleId: null,
            },
          });
        }
      }
    }

    return rooms;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  roomId: string,
  senderId: string,
  message: string,
  messageType: "text" | "image" | "file" = "text"
): Promise<string> => {
  try {
    const messagesRef = collection(db, "chatMessages");
    const messageData = {
      roomId,
      senderId,
      message,
      messageType,
      createdAt: serverTimestamp(),
      isRead: false,
    };

    const messageRef = await addDoc(messagesRef, messageData);

    // Update chat room with last message info
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, {
      lastMessage: message,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Increment unread count for other participants who are not currently in the room
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      const otherParticipants = roomData.participants.filter(
        (id: string) => id !== senderId
      );

      const unreadUpdates: any = {};

      // Check each participant's chat page presence before incrementing unread count
      for (const participantId of otherParticipants) {
        const isInChatPage = await isUserInChatPage(participantId);
        console.log("sendMessage - checking participant:", {
          participantId,
          isInChatPage,
          willIncrement: !isInChatPage,
        });
        if (!isInChatPage) {
          // Only increment unread count if user is not currently on any chat page
          unreadUpdates[`unreadCounts.${participantId}`] = increment(1);
        }
      }

      if (Object.keys(unreadUpdates).length > 0) {
        console.log("sendMessage - applying unread updates:", unreadUpdates);
        await updateDoc(roomRef, unreadUpdates);
        console.log("sendMessage - unread updates applied successfully");
      } else {
        console.log("sendMessage - no unread updates needed");
      }
    }

    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get messages for a chat room
export const getMessages = async (
  roomId: string,
  messageLimit: number = 50
): Promise<any[]> => {
  try {
    const messagesRef = collection(db, "chatMessages");
    const q = query(
      messagesRef,
      where("roomId", "==", roomId),
      orderBy("createdAt", "desc"),
      limit(messageLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .reverse(); // Reverse to show oldest first
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  roomId: string,
  userId: string
): Promise<boolean> => {
  try {
    console.log("🔍 markMessagesAsRead called:", { roomId, userId });

    // Get all messages in the room and filter in memory to avoid index issues
    const messagesRef = collection(db, "chatMessages");
    const q = query(messagesRef, where("roomId", "==", roomId));

    const snapshot = await getDocs(q);
    console.log("🔍 Found", snapshot.docs.length, "messages in room", roomId);

    const batch = writeBatch(db);
    let hasUpdates = false;
    let messagesToMark = 0;

    // Filter messages that need to be marked as read
    snapshot.docs.forEach((doc) => {
      const messageData = doc.data();
      console.log("🔍 Checking message:", {
        id: doc.id,
        senderId: messageData.senderId,
        userId,
        isRead: messageData.isRead,
        shouldMark:
          messageData.senderId !== userId && messageData.isRead === false,
      });

      if (messageData.senderId !== userId && messageData.isRead === false) {
        batch.update(doc.ref, { isRead: true });
        hasUpdates = true;
        messagesToMark++;
      }
    });

    console.log("🔍 Messages to mark as read:", messagesToMark);

    // Only commit if there are updates
    if (hasUpdates) {
      await batch.commit();
      console.log("✅ Marked", messagesToMark, "messages as read");
    } else {
      console.log("ℹ️ No messages needed to be marked as read");
    }

    // Reset unread count for the user
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, {
      [`unreadCounts.${userId}`]: 0,
    });
    console.log("✅ Reset unread count for user", userId, "in room", roomId);

    // Clear live notifications for this room
    await clearLiveNotificationsForRoom(roomId, userId);

    return hasUpdates;
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    throw error;
  }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (
  userId: string
): Promise<number> => {
  try {
    const chatRoomsRef = collection(db, "chatRooms");
    const q = query(
      chatRoomsRef,
      where("participants", "array-contains", userId)
    );

    const snapshot = await getDocs(q);
    let totalUnread = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalUnread += data.unreadCounts?.[userId] || 0;
    });

    return totalUnread;
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
};

export const getNotificationsForUser = async (
  userId: string,
  limitCount: number = 50,
  startAfterDoc?: any
): Promise<Notification[]> => {
  try {
    let notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    // Add pagination if startAfterDoc is provided
    if (startAfterDoc) {
      notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        startAfter(startAfterDoc),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Notification)
    );
  } catch (error) {
    console.error("Error fetching notifications for user:", error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (
  userId: string
): Promise<number> => {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    const snapshot = await getDocs(notificationsQuery);

    if (snapshot.empty) {
      return; // No unread notifications
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Department and Role Management
export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Role {
  id: string;
  name: string;
  departmentId: string;
  subcategoryId?: string;
  description?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  bio?: string;
  is_email_verified: boolean;
  verification_token?: string;
  verification_token_expires?: string;
  password_reset_token?: string;
  password_reset_expires?: string;
  is_active: boolean;
  is_admin: boolean;
  is_online?: boolean;
  created_at: string;
  updated_at: string;
  profile_photo?: string;
  department_id?: string;
  subcategory_id?: string;
  role_id?: string;
  current_ship_id?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
  website?: string;
  additional_photo_1?: string;
  additional_photo_2?: string;
  additional_photo_3?: string;
  is_banned: boolean;
  ban_expires_at?: string;
  ban_reason?: string;
  last_login?: string;
}

export interface CruiseLine {
  id: string;
  name: string;
  companyCode?: string;
  headquarters?: string;
  foundedYear?: number;
  fleetSize?: number;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Ship {
  id: string;
  name: string;
  cruiseLineId: string;
  shipCode?: string;
  lengthMeters?: number;
  widthMeters?: number;
  grossTonnage?: number;
  yearBuilt?: number;
  refurbishedYear?: number;
  homePort?: string;
  shipType?: string;
  company?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const departmentsRef = collection(db, "departments");
    const q = query(departmentsRef, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Department)
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

// Add new department
export const addDepartment = async (departmentData: {
  name: string;
  description?: string;
}): Promise<string> => {
  try {
    const departmentsRef = collection(db, "departments");
    const docRef = await addDoc(departmentsRef, {
      name: departmentData.name.trim(),
      description: departmentData.description?.trim() || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
};

// Delete department
export const deleteDepartment = async (departmentId: string): Promise<void> => {
  try {
    const departmentRef = doc(db, "departments", departmentId);
    await deleteDoc(departmentRef);
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};

// Get all cruise lines
export const getCruiseLines = async (): Promise<CruiseLine[]> => {
  try {
    const cruiseLinesRef = collection(db, "cruiseLines");
    const q = query(cruiseLinesRef, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as CruiseLine)
    );
  } catch (error) {
    console.error("Error fetching cruise lines:", error);
    throw error;
  }
};

// Add new cruise line
export const addCruiseLine = async (cruiseLineData: {
  name: string;
  companyCode?: string;
  headquarters?: string;
  foundedYear?: number;
  fleetSize?: number;
  website?: string;
  logoUrl?: string;
}): Promise<string> => {
  try {
    const cruiseLinesRef = collection(db, "cruiseLines");
    const docRef = await addDoc(cruiseLinesRef, {
      name: cruiseLineData.name.trim(),
      companyCode: cruiseLineData.companyCode?.trim() || "",
      headquarters: cruiseLineData.headquarters?.trim() || "",
      foundedYear: cruiseLineData.foundedYear || null,
      fleetSize: cruiseLineData.fleetSize || null,
      website: cruiseLineData.website?.trim() || "",
      logoUrl: cruiseLineData.logoUrl?.trim() || "",
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding cruise line:", error);
    throw error;
  }
};

// Delete cruise line
export const deleteCruiseLine = async (cruiseLineId: string): Promise<void> => {
  try {
    const cruiseLineRef = doc(db, "cruiseLines", cruiseLineId);
    await deleteDoc(cruiseLineRef);
  } catch (error) {
    console.error("Error deleting cruise line:", error);
    throw error;
  }
};

// Get all ships
export const getShips = async (): Promise<Ship[]> => {
  try {
    const shipsRef = collection(db, "ships");
    const q = query(shipsRef, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ship)
    );
  } catch (error) {
    console.error("Error fetching ships:", error);
    throw error;
  }
};

// Get ships by cruise line
export const getShipsByCruiseLine = async (
  cruiseLineId: string
): Promise<Ship[]> => {
  try {
    const shipsRef = collection(db, "ships");
    const q = query(
      shipsRef,
      where("cruiseLineId", "==", cruiseLineId)
      // Removed orderBy to avoid composite index requirement
    );
    const querySnapshot = await getDocs(q);

    const ships = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ship)
    );

    // Sort client-side instead
    return ships.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching ships by cruise line:", error);
    throw error;
  }
};

// Add new ship
export const addShip = async (shipData: {
  name: string;
  cruiseLineId: string;
  shipCode?: string;
  lengthMeters?: number;
  widthMeters?: number;
  grossTonnage?: number;
  yearBuilt?: number;
  refurbishedYear?: number;
  homePort?: string;
  shipType?: string;
  company?: string;
  capacity?: number;
}): Promise<string> => {
  try {
    const shipsRef = collection(db, "ships");
    const docRef = await addDoc(shipsRef, {
      name: shipData.name.trim(),
      cruiseLineId: shipData.cruiseLineId,
      shipCode: shipData.shipCode?.trim() || "",
      lengthMeters: shipData.lengthMeters || null,
      widthMeters: shipData.widthMeters || null,
      grossTonnage: shipData.grossTonnage || null,
      yearBuilt: shipData.yearBuilt || null,
      refurbishedYear: shipData.refurbishedYear || null,
      homePort: shipData.homePort?.trim() || "",
      shipType: shipData.shipType?.trim() || "",
      company: shipData.company?.trim() || "",
      capacity: shipData.capacity || null,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding ship:", error);
    throw error;
  }
};

// Delete ship
export const deleteShip = async (shipId: string): Promise<void> => {
  try {
    const shipRef = doc(db, "ships", shipId);
    await deleteDoc(shipRef);
  } catch (error) {
    console.error("Error deleting ship:", error);
    throw error;
  }
};

// Add new role
export const addRole = async (roleData: {
  name: string;
  departmentId: string;
  subcategoryId?: string;
  description?: string;
}): Promise<string> => {
  try {
    const rolesRef = collection(db, "roles");
    const docRef = await addDoc(rolesRef, {
      name: roleData.name.trim(),
      departmentId: roleData.departmentId,
      subcategoryId: roleData.subcategoryId || null,
      description: roleData.description?.trim() || "",
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding role:", error);
    throw error;
  }
};

// Delete role
export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    const roleRef = doc(db, "roles", roleId);
    await deleteDoc(roleRef);
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

// User Management Functions

// Get all users
export const getUsers = async (
  limitCount: number = 50,
  offset: number = 0
): Promise<{ users: User[]; total: number }> => {
  try {
    const usersRef = collection(db, "users");

    // Get total count first
    const countSnapshot = await getDocs(usersRef);
    const total = countSnapshot.size;

    // Get all users and then slice for pagination
    // Note: This is not optimal for large datasets, but works for now
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("data", data);
      users.push({
        id: doc.id,
        email: data.email || "",
        display_name: data.displayName || data.display_name || "",
        bio: data.bio || undefined,
        is_email_verified:
          data.isEmailVerified || data.is_email_verified || false,
        verification_token:
          data.verificationToken || data.verification_token || undefined,
        verification_token_expires:
          data.verificationTokenExpires?.toDate?.()?.toISOString() ||
          data.verification_token_expires ||
          undefined,
        password_reset_token:
          data.passwordResetToken || data.password_reset_token || undefined,
        password_reset_expires:
          data.passwordResetExpires?.toDate?.()?.toISOString() ||
          data.password_reset_expires ||
          undefined,
        is_active: data.isActive !== false, // Default to true if not set
        is_admin: data.isAdmin || data.is_admin || false,
        is_online: data.isOnline || false,
        created_at:
          data.createdAt?.toDate?.()?.toISOString() ||
          data.created_at ||
          new Date().toISOString(),
        updated_at:
          data.updatedAt?.toDate?.()?.toISOString() ||
          data.updated_at ||
          new Date().toISOString(),
        profile_photo: data.profilePhoto || data.profile_photo || undefined,
        department_id: data.departmentId || data.department_id || undefined,
        subcategory_id: data.subcategoryId || data.subcategory_id || undefined,
        role_id: data.roleId || data.role_id || undefined,
        current_ship_id:
          data.currentShipId || data.current_ship_id || undefined,
        phone: data.phone || undefined,
        instagram: data.instagram || undefined,
        twitter: data.twitter || undefined,
        facebook: data.facebook || undefined,
        snapchat: data.snapchat || undefined,
        website: data.website || undefined,
        additional_photo_1:
          data.additionalPhoto1 || data.additional_photo_1 || undefined,
        additional_photo_2:
          data.additionalPhoto2 || data.additional_photo_2 || undefined,
        additional_photo_3:
          data.additionalPhoto3 || data.additional_photo_3 || undefined,
        is_banned: data.isBanned || data.is_banned || false,
        ban_expires_at:
          data.banExpiresAt?.toDate?.()?.toISOString() ||
          data.ban_expires_at ||
          undefined,
        ban_reason: data.banReason || data.ban_reason || undefined,
        last_login:
          data.lastLoginAt?.toDate?.()?.toISOString() ||
          data.last_login ||
          undefined,
      });
    });

    return { users: users.slice(offset, offset + limitCount), total };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Ban user
export const banUser = async (
  userId: string,
  reason: string,
  expiresAt?: Date
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const updateData: any = {
      isBanned: true,
      banReason: reason,
      updatedAt: serverTimestamp(),
    };

    if (expiresAt) {
      updateData.banExpiresAt = expiresAt;
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error banning user:", error);
    throw error;
  }
};

// Unban user
export const unbanUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isBanned: false,
      banReason: null,
      banExpiresAt: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error unbanning user:", error);
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (
  userId: string,
  updates: {
    isActive?: boolean;
    isAdmin?: boolean;
    isEmailVerified?: boolean;
    departmentId?: string;
    subcategoryId?: string;
    roleId?: string;
    currentShipId?: string;
    phone?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    website?: string;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.isAdmin !== undefined) updateData.isAdmin = updates.isAdmin;
    if (updates.isEmailVerified !== undefined)
      updateData.emailVerified = updates.isEmailVerified;
    if (updates.departmentId !== undefined)
      updateData.departmentId = updates.departmentId;
    if (updates.subcategoryId !== undefined)
      updateData.subcategoryId = updates.subcategoryId;
    if (updates.roleId !== undefined) updateData.roleId = updates.roleId;
    if (updates.currentShipId !== undefined)
      updateData.currentShipId = updates.currentShipId;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.instagram !== undefined)
      updateData.instagram = updates.instagram;
    if (updates.twitter !== undefined) updateData.twitter = updates.twitter;
    if (updates.facebook !== undefined) updateData.facebook = updates.facebook;
    if (updates.snapchat !== undefined) updateData.snapchat = updates.snapchat;
    if (updates.website !== undefined) updateData.website = updates.website;

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// Update user's current ship assignment
export const updateUserShipAssignment = async (
  userId: string,
  shipId: string
) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currentShipId: shipId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating ship assignment:", error);
    throw error;
  }
};

// ============================================================================
// ASSIGNMENT FUNCTIONS
// ============================================================================

// Add a new assignment
export const addAssignment = async (
  userId: string,
  assignmentData: {
    cruiseLineId: string;
    shipId: string;
    startDate: string;
    endDate: string;
    description?: string;
    status?: string;
  }
) => {
  try {
    const assignmentsRef = collection(db, "assignments");
    const assignment = {
      userId,
      cruiseLineId: assignmentData.cruiseLineId,
      shipId: assignmentData.shipId,
      startDate: assignmentData.startDate,
      endDate: assignmentData.endDate,
      description: assignmentData.description || "",
      status: assignmentData.status || "upcoming",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(assignmentsRef, assignment);
    console.log("✅ Assignment added successfully:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding assignment:", error);
    throw error;
  }
};

// Update an existing assignment
export const updateAssignment = async (
  assignmentId: string,
  assignmentData: {
    cruiseLineId?: string;
    shipId?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    status?: string;
  }
) => {
  try {
    const assignmentRef = doc(db, "assignments", assignmentId);
    const updateData = {
      ...assignmentData,
      updatedAt: serverTimestamp(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    await updateDoc(assignmentRef, updateData);
    console.log("✅ Assignment updated successfully:", assignmentId);
    return true;
  } catch (error) {
    console.error("❌ Error updating assignment:", error);
    throw error;
  }
};

// Delete an assignment
export const deleteAssignment = async (assignmentId: string) => {
  try {
    const assignmentRef = doc(db, "assignments", assignmentId);
    await deleteDoc(assignmentRef);
    console.log("✅ Assignment deleted successfully:", assignmentId);
    return true;
  } catch (error) {
    console.error("❌ Error deleting assignment:", error);
    throw error;
  }
};

// Get user assignments
export const getUserAssignments = async (userId: string) => {
  try {
    if (!userId) {
      console.warn("⚠️ getUserAssignments: No userId provided");
      return [];
    }

    console.log("📅 Fetching assignments for user:", userId);

    const assignmentsRef = collection(db, "assignments");
    const q = query(assignmentsRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    const assignments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by start date (client-side to avoid index requirements)
    assignments.sort((a: any, b: any) => {
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      return dateA.getTime() - dateB.getTime();
    });

    console.log("📅 Found assignments:", assignments.length);
    return assignments;
  } catch (error) {
    console.error("❌ Error fetching user assignments:", error);
    return []; // Return empty array instead of throwing
  }
};

// Get assignments for a date range
export const getAssignmentsForDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
) => {
  try {
    if (!userId) {
      console.warn("⚠️ getAssignmentsForDateRange: No userId provided");
      return [];
    }

    console.log("📅 Fetching assignments for date range:", {
      userId,
      startDate,
      endDate,
    });

    const assignmentsRef = collection(db, "assignments");
    const q = query(assignmentsRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    let assignments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by date range client-side
    assignments = assignments.filter((assignment: any) => {
      const assignmentStart = new Date(assignment.startDate);
      const assignmentEnd = new Date(assignment.endDate);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      // Check if assignment overlaps with the date range
      return assignmentStart <= rangeEnd && assignmentEnd >= rangeStart;
    });

    // Sort by start date
    assignments.sort((a: any, b: any) => {
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      return dateA.getTime() - dateB.getTime();
    });

    console.log("📅 Found assignments in range:", assignments.length);
    return assignments;
  } catch (error) {
    console.error("❌ Error fetching assignments for date range:", error);
    return []; // Return empty array instead of throwing
  }
};

// Privacy settings functions
export const getPrivacySettings = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        userId: userData.id,
        isVerified: userData.isEmailVerified || false,
        isActive: userData.isActive !== false,
        showOnlyTodayShip: userData.showOnlyTodayShip || false,
        allowFutureShipVisibility: userData.allowFutureShipVisibility !== false,
        declineRequestsSilently: userData.declineRequestsSilently || false,
        blockEnforcesInvisibility: userData.blockEnforcesInvisibility !== false,
        lastActiveDate:
          userData.lastActiveDate || new Date().toISOString().split("T")[0],
        verificationStatus: userData.isEmailVerified
          ? ("verified" as const)
          : ("pending" as const),
      };
    }

    // Return default settings if user doesn't exist
    return {
      userId,
      isVerified: false,
      isActive: true,
      showOnlyTodayShip: false,
      allowFutureShipVisibility: true,
      declineRequestsSilently: false,
      blockEnforcesInvisibility: false,
      lastActiveDate: new Date().toISOString().split("T")[0],
      verificationStatus: "pending" as const,
    };
  } catch (error) {
    console.error("Error fetching privacy settings:", error);
    throw error;
  }
};

export const updatePrivacySettings = async (userId: string, settings: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      showOnlyTodayShip: settings.showOnlyTodayShip,
      allowFutureShipVisibility: settings.allowFutureShipVisibility,
      declineRequestsSilently: settings.declineRequestsSilently,
      blockEnforcesInvisibility: settings.blockEnforcesInvisibility,
      lastActiveDate: settings.lastActiveDate,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    throw error;
  }
};

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    const rolesRef = collection(db, "roles");
    const q = query(rolesRef);
    const querySnapshot = await getDocs(q);

    const roles = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Role)
    );

    return roles.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

// Get roles by department
export const getRolesByDepartment = async (
  departmentId: string
): Promise<Role[]> => {
  try {
    const rolesRef = collection(db, "roles");
    const q = query(rolesRef, where("departmentId", "==", departmentId));
    const querySnapshot = await getDocs(q);

    // Sort in memory to avoid index requirement
    const roles = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Role)
    );

    return roles.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching roles by department:", error);
    throw error;
  }
};

// Admin Statistics Functions

export interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    unverified: number;
  };
  messages: {
    total: number;
    today: number;
  };
  connections: {
    total: number;
    pending: number;
  };
  reports: {
    total: number;
    pending: number;
  };
}

// Get admin statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // Initialize default values
    let totalUsers = 0;
    let activeUsers = 0;
    let bannedUsers = 0;
    let unverifiedUsers = 0;
    let totalMessages = 0;
    let todayMessages = 0;
    let totalConnections = 0;
    let pendingConnections = 0;
    let totalReports = 0;
    let pendingReports = 0;

    // Get all users for user statistics
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        totalUsers++;

        if (data.isBanned || data.is_banned) {
          bannedUsers++;
        } else if (data.isActive !== false) {
          activeUsers++;
        }

        if (!data.emailVerified && !data.is_email_verified) {
          unverifiedUsers++;
        }
      });
    } catch (error) {
      console.warn("Error fetching users for stats:", error);
    }

    // Get messages statistics
    try {
      const messagesRef = collection(db, "chatMessages");
      const messagesSnapshot = await getDocs(messagesRef);
      totalMessages = messagesSnapshot.size;

      // Calculate today's messages
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      todayMessages = Array.from(messagesSnapshot.docs).filter((doc) => {
        const messageData = doc.data();
        const messageDate =
          messageData.createdAt?.toDate?.() || new Date(messageData.created_at);
        return messageDate >= today;
      }).length;
    } catch (error) {
      console.warn("Error fetching messages for stats:", error);
    }

    // Get connections statistics
    try {
      const connectionsRef = collection(db, "connections");
      const connectionsSnapshot = await getDocs(connectionsRef);
      totalConnections = connectionsSnapshot.size;
    } catch (error) {
      console.warn("Error fetching connections for stats:", error);
    }

    // Get connection requests for pending connections
    try {
      const connectionRequestsRef = collection(db, "connectionRequests");
      const connectionRequestsSnapshot = await getDocs(connectionRequestsRef);
      pendingConnections = connectionRequestsSnapshot.size;
    } catch (error) {
      console.warn("Error fetching connection requests for stats:", error);
    }

    // Get reports statistics
    try {
      const reportsRef = collection(db, "reports");
      const reportsSnapshot = await getDocs(reportsRef);
      totalReports = reportsSnapshot.size;

      // Calculate pending reports (assuming reports have a status field)
      pendingReports = Array.from(reportsSnapshot.docs).filter((doc) => {
        const reportData = doc.data();
        return (
          reportData.status !== "resolved" && reportData.status !== "closed"
        );
      }).length;
    } catch (error) {
      console.warn("Error fetching reports for stats:", error);
    }

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        unverified: unverifiedUsers,
      },
      messages: {
        total: totalMessages,
        today: todayMessages,
      },
      connections: {
        total: totalConnections,
        pending: pendingConnections,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// Support Statistics Functions

export interface SupportStats {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  totalTickets: number;
  resolvedToday: number;
}

// Get support statistics
export const getSupportStats = async (): Promise<SupportStats> => {
  try {
    // Get all support tickets from the supportTickets collection
    const ticketsRef = collection(db, "supportTickets");
    const querySnapshot = await getDocs(ticketsRef);

    let openTickets = 0;
    let inProgressTickets = 0;
    let resolvedTickets = 0;
    let closedTickets = 0;
    let resolvedToday = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.status;
      const updatedAt = data.updatedAt?.toDate() || new Date();

      // Count tickets by status
      switch (status) {
        case "open":
          openTickets++;
          break;
        case "in_progress":
          inProgressTickets++;
          break;
        case "resolved":
          resolvedTickets++;
          // Check if resolved today
          if (updatedAt >= today) {
            resolvedToday++;
          }
          break;
        case "closed":
          closedTickets++;
          break;
      }
    });

    const totalTickets =
      openTickets + inProgressTickets + resolvedTickets + closedTickets;

    console.log("📊 Support stats calculated:", {
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      totalTickets,
      resolvedToday,
    });

    return {
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      totalTickets,
      resolvedToday,
    };
  } catch (error) {
    console.error("❌ Error getting support statistics:", error);
    // Return zeros if there's an error
    return {
      openTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      totalTickets: 0,
      resolvedToday: 0,
    };
  }
};

// Get crew members with pagination and filtering
export const getCrewMembers = async (
  params: {
    cruiseLineId?: string;
    shipId?: string;
    roleId?: string;    
    page?: number;
    limit?: number;
    currentUserId?: string;
  } = {}
): Promise<{
  crew: any[];
  hasNextPage: boolean;
  nextPage?: number;
  total: number;
}> => {
  try {
    const { cruiseLineId, shipId, page = 0, limit: pageLimit = 20 } = params;

    console.log("getCrewMembers called with params:", params);

    let constraints: any[] = [];

    // For now, let's fetch all users and filter client-side to avoid index requirements
    // This is simpler and works without needing composite indexes
    constraints.push(orderBy("displayName"));

    // Note: Admin filtering is done client-side to avoid index requirements
    // TODO: Re-enable database-level filtering once index is built
    // constraints.push(where('isAdmin', '==', false));

    constraints.push(limit(pageLimit + 1)); // Get one extra to check if there are more pages

    console.log("Query constraints:", constraints);

    const q = query(collection(db, "users"), ...constraints);
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    console.log("Query returned", docs.length, "documents");

    const hasNextPage = docs.length > pageLimit;
    let crew = docs.slice(0, pageLimit).map((doc) => {
      const data = doc.data();
      console.log("Crew member data:", {
        id: doc.id,
        displayName: data.displayName,
        currentShipId: data.currentShipId,
      });
      return {
        id: doc.id,
        ...data,
      };
    });

    // Apply client-side filtering for ship
    if (shipId) {
      crew = crew.filter((member) => (member as any).currentShipId === shipId);
    }

    // Apply client-side filtering for role
    if (params.roleId) {
      crew = crew.filter((member) => (member as any).roleId === params.roleId);
    }

    crew = crew.filter((member) => !(member as any).isAdmin);

    // Exclude current user from crew members list
    if (params.currentUserId) {
      const beforeSelfFilter = crew.length;
      crew = crew.filter((member) => member.id !== params.currentUserId);
      const afterSelfFilter = crew.length;
      console.log(
        `Self filtering: ${beforeSelfFilter} -> ${afterSelfFilter} (excluded ${
          beforeSelfFilter - afterSelfFilter
        } self)`
      );
    }
    // If cruiseLineId filter is provided, filter the results client-side
    let filteredCrew = crew;
    if (cruiseLineId) {
      // We'll need to get the ship data to filter by cruise line
      // For now, return all crew and let the client handle the filtering
      console.log("Cruise line filtering will be handled client-side");
    }

    return {
      crew: filteredCrew,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : undefined,
      total: docs.length,
    };
  } catch (error) {
    console.error("Error fetching crew members:", error);
    throw error;
  }
};

// ============================================================================
// REALTIME FEATURES (Firestore-based, migrated from Realtime Database)
// ============================================================================

// Typing Indicators
export const setTypingIndicator = async (
  roomId: string,
  userId: string,
  userName: string,
  isTyping: boolean
) => {
  try {
    const typingRef = doc(db, "typing", `${roomId}_${userId}`);

    if (isTyping) {
      await setDoc(
        typingRef,
        {
          isTyping: true,
          timestamp: Date.now(),
          userId,
          userName,
          roomId,
        },
        { merge: true }
      );

      // Auto-remove typing indicator after 3 seconds
      setTimeout(async () => {
        try {
          await deleteDoc(typingRef);
        } catch (error) {
          console.error("Error auto-removing typing indicator:", error);
        }
      }, 3000);
    } else {
      await deleteDoc(typingRef);
    }
  } catch (error) {
    console.error("Error setting typing indicator:", error);
  }
};

export const subscribeToTypingIndicators = (
  roomId: string,
  callback: (typingUsers: TypingIndicator[]) => void
) => {
  try {
    const typingRef = collection(db, "typing");
    const q = query(typingRef, where("roomId", "==", roomId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingUsers: TypingIndicator[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include recent typing indicators (within 5 seconds)
        if (data.isTyping && Date.now() - data.timestamp < 5000) {
          typingUsers.push({
            isTyping: data.isTyping,
            timestamp: data.timestamp,
            userId: data.userId,
            userName: data.userName,
          });
        }
      });
      callback(typingUsers);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to typing indicators:", error);
    return () => {};
  }
};

// Online Presence
export const setUserPresence = async (
  userId: string,
  userName: string,
  status: "online" | "offline" | "away" = "online"
) => {
  try {
    if (!userId || !userName) {
      console.log("Missing userId or userName for presence");
      return;
    }

    const presenceRef = doc(db, "presence", userId);

    const presenceData = {
      status,
      lastSeen: Date.now(),
      userId,
      userName,
    };

    await setDoc(presenceRef, presenceData, { merge: true });
    console.log("✅ User presence set successfully");
    return presenceData;
  } catch (error) {
    console.error("Error setting user presence:", error);
    // Don't throw error to prevent app crashes
    return null;
  }
};

export const subscribeToUserPresence = (
  userId: string,
  callback: (presence: PresenceStatus | null) => void
) => {
  try {
    const presenceRef = doc(db, "presence", userId);

    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          status: data.status,
          lastSeen: data.lastSeen,
          userId: data.userId,
          userName: data.userName,
        });
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to user presence:", error);
    return () => {};
  }
};

export const subscribeToRoomPresence = (
  roomId: string,
  callback: (presenceList: PresenceStatus[]) => void
) => {
  try {
    const roomPresenceRef = collection(db, "roomPresence");
    const q = query(roomPresenceRef, where("roomId", "==", roomId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const presenceList: PresenceStatus[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        presenceList.push({
          status: data.status,
          lastSeen: data.lastSeen,
          userId: data.userId,
          userName: data.userName,
        });
      });
      callback(presenceList);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to room presence:", error);
    return () => {};
  }
};

export const joinRoomPresence = async (
  roomId: string,
  userId: string,
  userName: string
) => {
  try {
    const roomPresenceRef = doc(db, "roomPresence", `${roomId}_${userId}`);
    const userPresenceRef = doc(db, "presence", userId);

    const presenceData = {
      status: "online",
      lastSeen: Date.now(),
      userId,
      userName,
      roomId,
    };

    await setDoc(roomPresenceRef, presenceData, { merge: true });
    await setDoc(userPresenceRef, presenceData, { merge: true });

    return presenceData;
  } catch (error) {
    console.error("Error joining room presence:", error);
    throw error;
  }
};

export const leaveRoomPresence = async (roomId: string, userId: string) => {
  try {
    const roomPresenceRef = doc(db, "roomPresence", `${roomId}_${userId}`);
    await deleteDoc(roomPresenceRef);
  } catch (error) {
    console.error("Error leaving room presence:", error);
  }
};

// Check if a user is currently in a room
export const isUserInRoom = async (
  roomId: string,
  userId: string
): Promise<boolean> => {
  try {
    const roomPresenceRef = doc(db, "roomPresence", `${roomId}_${userId}`);
    const presenceDoc = await getDoc(roomPresenceRef);
    return presenceDoc.exists();
  } catch (error) {
    console.error("Error checking room presence:", error);
    return false;
  }
};

// Check if a user is currently viewing any chat-related page
export const isUserInChatPage = async (userId: string): Promise<boolean> => {
  try {
    // Check if user is in any room presence (indicating they're on a chat page)
    const roomPresenceRef = collection(db, "roomPresence");
    const q = query(roomPresenceRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking chat page presence:", error);
    return false;
  }
};

// Live Notifications
export const sendLiveNotification = async (
  userId: string,
  type: "message" | "connection_request" | "system",
  title: string,
  message: string,
  roomId?: string
) => {
  try {
    console.log("🔔 sendLiveNotification called with:", {
      userId,
      type,
      title,
      message,
      roomId,
    });

    const notificationsRef = collection(db, "liveNotifications");

    // Build notification data, filtering out undefined values
    const notificationData: any = {
      type,
      title,
      message,
      userId,
      timestamp: Date.now(),
      read: false,
    };

    // Only add roomId if it's defined
    if (roomId) {
      notificationData.roomId = roomId;
    }

    console.log("🔔 About to save notification data:", notificationData);

    const docRef = await addDoc(notificationsRef, notificationData);

    console.log("🔔 Notification saved to Firestore with ID:", docRef.id);

    return {
      id: docRef.id,
      ...notificationData,
    };
  } catch (error) {
    console.error("❌ Error sending live notification:", error);
    throw error;
  }
};

export const subscribeToLiveNotifications = (
  userId: string,
  callback: (notifications: LiveNotification[]) => void
) => {
  try {
    console.log(
      "🔔 Setting up live notifications subscription for user:",
      userId
    );
    const notificationsRef = collection(db, "liveNotifications");
    const q = query(notificationsRef, where("userId", "==", userId), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "📥 Live notifications snapshot received:",
          snapshot.docs.length,
          "documents for user:",
          userId
        );
        const notifications: LiveNotification[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log(
            "📥 Processing notification document:",
            doc.id,
            "data:",
            data
          );

          const notification: LiveNotification = {
            id: doc.id,
            type: data.type,
            title: data.title,
            message: data.message,
            userId: data.userId,
            timestamp: data.timestamp,
            read: data.read,
          };

          // Only add roomId if it exists
          if (data.roomId) {
            notification.roomId = data.roomId;
          }

          notifications.push(notification);
        });

        // Sort notifications by timestamp (newest first) - client-side sorting
        notifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        console.log(
          "📥 Calling callback with",
          notifications.length,
          "notifications for user:",
          userId
        );

        console.log(
          "📋 Processed notifications:",
          notifications.length,
          "notifications"
        );
        callback(notifications);
      },
      (error) => {
        console.error("❌ Live notifications subscription error:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to live notifications:", error);
    return () => {};
  }
};

export const markLiveNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, "liveNotifications", notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error("Error marking live notification as read:", error);
  }
};

// Clear all live notifications for a specific room and user
export const clearLiveNotificationsForRoom = async (
  roomId: string,
  userId: string
) => {
  try {
    console.log(
      "🔔 Clearing live notifications for room:",
      roomId,
      "user:",
      userId
    );

    const notificationsRef = collection(db, "liveNotifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("roomId", "==", roomId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    console.log(
      "🔔 Found",
      snapshot.docs.length,
      "unread live notifications for room",
      roomId
    );

    if (snapshot.docs.length > 0) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
      console.log(
        "✅ Cleared",
        snapshot.docs.length,
        "live notifications for room",
        roomId
      );
    } else {
      console.log("ℹ️ No live notifications to clear for room", roomId);
    }
  } catch (error) {
    console.error("❌ Error clearing live notifications for room:", error);
  }
};

export const clearAllNotifications = async (userId: string) => {
  try {
    console.log("🗑️ Clearing all live notifications for user:", userId);

    const notificationsRef = collection(db, "liveNotifications");
    const q = query(notificationsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      console.log("ℹ️ No live notifications to clear");
      return;
    }

    // Use batch delete to avoid individual deletion notifications
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("✅ Cleared", snapshot.docs.length, "live notifications");
  } catch (error) {
    console.error("❌ Error clearing live notifications:", error);
    throw error;
  }
};

export const clearAllLegacyNotifications = async (userId: string) => {
  try {
    console.log("🗑️ Clearing all legacy notifications for user:", userId);

    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      console.log("ℹ️ No legacy notifications to clear");
      return;
    }

    // Use batch delete to avoid individual deletion notifications
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("✅ Cleared", snapshot.docs.length, "legacy notifications");
  } catch (error) {
    console.error("❌ Error clearing legacy notifications:", error);
    throw error;
  }
};

// Convenience functions
export const startTyping = (
  roomId: string,
  userId: string,
  userName: string
) => {
  setTypingIndicator(roomId, userId, userName, true);
};

export const stopTyping = (roomId: string, userId: string) => {
  setTypingIndicator(roomId, userId, "", false);
};

// Cleanup functions
export const cleanupPresence = async (userId: string) => {
  try {
    const presenceRef = doc(db, "presence", userId);
    await deleteDoc(presenceRef);
  } catch (error) {
    console.error("Error cleaning up presence:", error);
  }
};

export const cleanupRoomPresence = async (roomId: string, userId: string) => {
  try {
    const roomPresenceRef = doc(db, "roomPresence", `${roomId}_${userId}`);
    await deleteDoc(roomPresenceRef);
  } catch (error) {
    console.error("Error cleaning up room presence:", error);
  }
};

// Test function (simplified for Firestore)
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("🧪 Testing Firestore connection...");
    const testRef = doc(db, "test", "connection");
    await setDoc(testRef, { timestamp: Date.now() });
    await deleteDoc(testRef);
    console.log("✅ Firestore connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Firestore connection test failed:", error);
    return false;
  }
};

// Test function for live notifications
export const testLiveNotification = async (
  userId: string
): Promise<boolean> => {
  try {
    console.log("🧪 Testing live notification creation for user:", userId);
    const notification = await sendLiveNotification(
      userId,
      "system",
      "Test Notification",
      "This is a test notification to verify the system is working"
    );
    console.log("✅ Live notification test successful:", notification.id);
    return true;
  } catch (error) {
    console.error("❌ Live notification test failed:", error);
    return false;
  }
};

// Real-time subscription for connection requests
export const subscribeToConnectionRequests = (
  userId: string,
  callback: (requests: any[]) => void
) => {
  try {
    console.log(
      "🔗 Setting up connection requests subscription for user:",
      userId
    );
    const requestsRef = collection(db, "connectionRequests");
    const q = query(
      requestsRef,
      where("receiverId", "==", userId),
      where("status", "==", "pending"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        console.log(
          "📥 Connection requests snapshot received:",
          snapshot.docs.length,
          "documents"
        );

        // Get basic request data
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        // Helper functions to get names (same as getReceivedConnectionRequests)
        const getDepartmentName = async (departmentId: string) => {
          try {
            const departmentDoc = await getDoc(
              doc(db, "departments", departmentId)
            );
            return departmentDoc.exists()
              ? departmentDoc.data().name
              : "Unknown Department";
          } catch (error) {
            return "Unknown Department";
          }
        };

        const getRoleName = async (roleId: string) => {
          try {
            const roleDoc = await getDoc(doc(db, "roles", roleId));
            return roleDoc.exists() ? roleDoc.data().name : "Unknown Role";
          } catch (error) {
            return "Unknown Role";
          }
        };

        // Fetch requester profiles for each request
        const requestsWithProfiles = await Promise.all(
          requests.map(async (request) => {
            try {
              const requesterProfile = (await getUserProfile(
                request.requesterId
              )) as any;

              // Get ship and cruise line information
              let shipName = "Not specified";
              let cruiseLineName = "Not specified";

              if (requesterProfile.currentShipId) {
                try {
                  const shipDoc = await getDoc(
                    doc(db, "ships", requesterProfile.currentShipId)
                  );
                  if (shipDoc.exists()) {
                    const shipData = shipDoc.data();
                    shipName = shipData.name;

                    // Get cruise line from ship
                    if (shipData.cruiseLineId) {
                      const cruiseLineDoc = await getDoc(
                        doc(db, "cruiseLines", shipData.cruiseLineId)
                      );
                      if (cruiseLineDoc.exists()) {
                        cruiseLineName = cruiseLineDoc.data().name;
                      }
                    }
                  }
                } catch (error) {
                  // Ignore ship/cruise line errors
                }
              }

              return {
                ...request,
                requesterName: requesterProfile.displayName,
                requesterPhoto: requesterProfile.profilePhoto,
                shipName,
                cruiseLineName,
                departmentName: requesterProfile.departmentId
                  ? await getDepartmentName(requesterProfile.departmentId)
                  : "Not specified",
                roleName: requesterProfile.roleId
                  ? await getRoleName(requesterProfile.roleId)
                  : "Not specified",
              };
            } catch (error) {
              console.error(
                `Error fetching profile for ${request.requesterId}:`,
                error
              );
              return {
                ...request,
                requesterName: "Unknown User",
                requesterPhoto: null,
                shipName: "Not specified",
                cruiseLineName: "Not specified",
                departmentName: "Not specified",
                roleName: "Not specified",
              };
            }
          })
        );

        // Sort by createdAt descending in memory
        const sortedRequests = requestsWithProfiles.sort((a, b) => {
          const aTime = (a as any).createdAt?.seconds || 0;
          const bTime = (b as any).createdAt?.seconds || 0;
          return bTime - aTime;
        });

        console.log(
          "📋 Processed connection requests:",
          sortedRequests.length,
          "requests"
        );
        callback(sortedRequests);
      },
      (error) => {
        console.error("❌ Connection requests subscription error:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to connection requests:", error);
    return () => {};
  }
};

// ========================================
// PORT DETECTION SYSTEM
// ========================================

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Helper function to get end of day timestamp
const getEndOfDayTimestamp = (): number => {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime();
};

// Track when a user searches for another ship
export const trackShipSearch = async (
  searcherUserId: string,
  searcherShipId: string,
  targetShipId: string
): Promise<void> => {
  try {
    // Don't track searches for the same ship
    if (searcherShipId === targetShipId) return;

    const today = getTodayDateString();
    const searchesRef = collection(db, "shipSearches");

    // Check if this user already searched for this ship today
    const existingSearchQuery = query(
      searchesRef,
      where("searcherUserId", "==", searcherUserId),
      where("targetShipId", "==", targetShipId),
      where("searchDate", "==", today)
    );

    const existingSearch = await getDocs(existingSearchQuery);

    // Only track one search per user per target ship per day
    if (existingSearch.empty) {
      const searchData: ShipSearch = {
        searcherUserId,
        searcherShipId,
        targetShipId,
        searchDate: today,
        timestamp: Date.now(),
      };

      await addDoc(searchesRef, searchData);
      console.log("🔍 Tracked ship search:", searcherShipId, "→", targetShipId);

      // Check if this search triggers a port link
      await checkAndCreatePortLink(searcherShipId, targetShipId);
    }
  } catch (error) {
    console.error("Error tracking ship search:", error);
  }
};

// Check if two ships should be linked based on actual connections between users
const checkAndCreatePortLink = async (
  shipAId: string,
  shipBId: string
): Promise<void> => {
  try {
    // Get all users from both ships
    const usersRef = collection(db, "users");

    const [shipAUsersSnapshot, shipBUsersSnapshot] = await Promise.all([
      getDocs(query(usersRef, where("currentShipId", "==", shipAId))),
      getDocs(query(usersRef, where("currentShipId", "==", shipBId))),
    ]);

    const shipAUserIds = shipAUsersSnapshot.docs.map((doc) => doc.id);
    const shipBUserIds = shipBUsersSnapshot.docs.map((doc) => doc.id);

    // Count connections between users from these two ships
    const connectionsRef = collection(db, "connections");
    let connectionCount = 0;

    // Check connections from Ship A users to Ship B users
    for (const shipAUserId of shipAUserIds) {
      const connectionsQuery = query(
        connectionsRef,
        where("userId", "==", shipAUserId)
      );

      const connectionsSnapshot = await getDocs(connectionsQuery);

      connectionsSnapshot.forEach((doc) => {
        const connection = doc.data();
        if (shipBUserIds.includes(connection.connectedUserId)) {
          connectionCount++;
        }
      });
    }

    console.log("🔗 Connection count between ships:", {
      shipA: shipAId,
      shipB: shipBId,
      connectionCount,
      threshold: 5,
    });

    // Check if threshold is met (5+ connections between the ships)
    if (connectionCount >= 5) {
      await createPortLink(shipAId, shipBId, connectionCount, 0);
    }
  } catch (error) {
    console.error("Error checking port link threshold:", error);
  }
};

// Create a port link between two ships
const createPortLink = async (
  shipAId: string,
  shipBId: string,
  shipASearchCount: number,
  shipBSearchCount: number
): Promise<void> => {
  try {
    const today = getTodayDateString();
    const portLinksRef = collection(db, "portLinks");

    // Check if link already exists for today
    const existingLinkQuery = query(
      portLinksRef,
      where("linkDate", "==", today),
      where("isActive", "==", true)
    );

    const existingLinks = await getDocs(existingLinkQuery);
    const linkExists = existingLinks.docs.some((doc) => {
      const data = doc.data();
      return (
        (data.shipAId === shipAId && data.shipBId === shipBId) ||
        (data.shipAId === shipBId && data.shipBId === shipAId)
      );
    });

    if (linkExists) {
      console.log("🚢 Port link already exists for today");
      return;
    }

    // Get ship names for better UX
    const [shipADoc, shipBDoc] = await Promise.all([
      getDoc(doc(db, "ships", shipAId)),
      getDoc(doc(db, "ships", shipBId)),
    ]);

    const shipAName = shipADoc.exists() ? shipADoc.data().name : "Unknown Ship";
    const shipBName = shipBDoc.exists() ? shipBDoc.data().name : "Unknown Ship";

    const portLinkData: PortLink = {
      shipAId,
      shipBId,
      shipAName,
      shipBName,
      linkDate: today,
      createdAt: Date.now(),
      expiresAt: getEndOfDayTimestamp(),
      searchCount: {
        shipA: shipASearchCount,
        shipB: shipBSearchCount,
      },
      isActive: true,
    };

    await addDoc(portLinksRef, portLinkData);

    console.log("🚢 Port link created:", {
      shipA: shipAName,
      shipB: shipBName,
      date: today,
      searchCounts: { shipA: shipASearchCount, shipB: shipBSearchCount },
    });

    // Send notifications to users on both ships
    await sendPortLinkNotifications(shipAId, shipBId, shipAName, shipBName);
  } catch (error) {
    console.error("Error creating port link:", error);
  }
};

// Send notifications when ships are linked
const sendPortLinkNotifications = async (
  shipAId: string,
  shipBId: string,
  shipAName: string,
  shipBName: string
): Promise<void> => {
  try {
    // Get users from both ships
    const usersRef = collection(db, "users");

    const [shipAUsersQuery, shipBUsersQuery] = await Promise.all([
      getDocs(query(usersRef, where("currentShipId", "==", shipAId))),
      getDocs(query(usersRef, where("currentShipId", "==", shipBId))),
    ]);

    // Send notifications to Ship A users about Ship B
    const shipANotifications = shipAUsersQuery.docs.map((userDoc) =>
      sendLiveNotification(
        userDoc.id,
        "system",
        "🚢 Ship in Port",
        `It looks like ${shipBName} is in port with you today!`
      )
    );

    // Send notifications to Ship B users about Ship A
    const shipBNotifications = shipBUsersQuery.docs.map((userDoc) =>
      sendLiveNotification(
        userDoc.id,
        "system",
        "🚢 Ship in Port",
        `It looks like ${shipAName} is in port with you today!`
      )
    );

    await Promise.all([...shipANotifications, ...shipBNotifications]);

    console.log("🔔 Port link notifications sent to both ships");
  } catch (error) {
    console.error("Error sending port link notifications:", error);
  }
};

// Create a manual port link between two ships
export const createManualPortLink = async (
  currentShipId: string,
  targetShipId: string
): Promise<void> => {
  try {
    console.log("🚢 Creating manual port link:", {
      currentShipId,
      targetShipId,
    });

    // Use the private createPortLink function with manual search counts
    await createPortLink(currentShipId, targetShipId, 1, 1);

    console.log("✅ Manual port link created successfully");
  } catch (error) {
    console.error("Error creating manual port link:", error);
    throw error;
  }
};

// Get active port links for a ship today
export const getActivePortLinks = async (
  shipId: string
): Promise<PortLink[]> => {
  try {
    const today = getTodayDateString();
    const portLinksRef = collection(db, "portLinks");

    const q = query(
      portLinksRef,
      where("linkDate", "==", today),
      where("isActive", "==", true)
    );

    const snapshot = await getDocs(q);
    const links: PortLink[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as PortLink;
      // Include links where this ship is either shipA or shipB
      if (data.shipAId === shipId || data.shipBId === shipId) {
        links.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return links;
  } catch (error) {
    console.error("Error fetching active port links:", error);
    return [];
  }
};

// Get suggested crew profiles from linked ships
export const getSuggestedPortCrewProfiles = async (
  currentUserShipId: string,
  currentUserDepartmentId?: string,
  maxResults: number = 6
): Promise<any[]> => {
  try {
    const activeLinks = await getActivePortLinks(currentUserShipId);

    if (activeLinks.length === 0) {
      return [];
    }

    // Get the other ship(s) we're linked with
    const linkedShipIds = activeLinks.map((link) =>
      link.shipAId === currentUserShipId ? link.shipBId : link.shipAId
    );

    const usersRef = collection(db, "users");
    const suggestedProfiles: any[] = [];

    for (const linkedShipId of linkedShipIds) {
      let q = query(
        usersRef,
        where("currentShipId", "==", linkedShipId),
        limit(maxResults)
      );

      // Prioritize same department if available
      if (currentUserDepartmentId) {
        q = query(
          usersRef,
          where("currentShipId", "==", linkedShipId),
          where("departmentId", "==", currentUserDepartmentId),
          limit(Math.ceil(maxResults / 2))
        );
      }

      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        const userData = doc.data();
        suggestedProfiles.push({
          id: doc.id,
          displayName: userData.displayName,
          profilePhoto: userData.profilePhoto,
          roleId: userData.roleId,
          departmentId: userData.departmentId,
          currentShipId: userData.currentShipId,
        });
      });
    }

    return suggestedProfiles.slice(0, maxResults);
  } catch (error) {
    console.error("Error fetching suggested port crew profiles:", error);
    return [];
  }
};

// Check for port links when a new connection is made
export const checkPortLinksOnConnection = async (
  userId1: string,
  userId2: string
): Promise<void> => {
  try {
    // Get user profiles to find their ships
    const [user1Profile, user2Profile] = await Promise.all([
      getUserProfile(userId1),
      getUserProfile(userId2),
    ]);

    const ship1Id = (user1Profile as any)?.currentShipId;
    const ship2Id = (user2Profile as any)?.currentShipId;

    // Only check if users are on different ships
    if (ship1Id && ship2Id && ship1Id !== ship2Id) {
      console.log(
        "🔗 New connection between different ships, checking port link threshold:",
        {
          ship1: ship1Id,
          ship2: ship2Id,
          user1: userId1,
          user2: userId2,
        }
      );

      await checkAndCreatePortLink(ship1Id, ship2Id);
    }
  } catch (error) {
    console.error("Error checking port links on connection:", error);
  }
};

// Clean up expired port links (should be run daily)
export const cleanupExpiredPortLinks = async (): Promise<void> => {
  try {
    const now = Date.now();
    const portLinksRef = collection(db, "portLinks");

    const expiredLinksQuery = query(
      portLinksRef,
      where("expiresAt", "<", now),
      where("isActive", "==", true)
    );

    const expiredLinks = await getDocs(expiredLinksQuery);

    if (expiredLinks.empty) {
      console.log("🧹 No expired port links to clean up");
      return;
    }

    const batch = writeBatch(db);
    expiredLinks.forEach((doc) => {
      batch.update(doc.ref, { isActive: false });
    });

    await batch.commit();
    console.log(`🧹 Cleaned up ${expiredLinks.size} expired port links`);
  } catch (error) {
    console.error("Error cleaning up expired port links:", error);
  }
};

// Database cleanup functions for admin use
export const cleanupAllDepartments = async (): Promise<number> => {
  try {
    console.log("🧹 Starting cleanup of all departments...");
    const departmentsRef = collection(db, "departments");
    const snapshot = await getDocs(departmentsRef);

    if (snapshot.docs.length === 0) {
      console.log("ℹ️ No departments to clean up");
      return 0;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Cleaned up ${snapshot.docs.length} departments`);
    return snapshot.docs.length;
  } catch (error) {
    console.error("❌ Error cleaning up departments:", error);
    throw error;
  }
};

export const cleanupAllRoles = async (): Promise<number> => {
  try {
    console.log("🧹 Starting cleanup of all roles...");
    const rolesRef = collection(db, "roles");
    const snapshot = await getDocs(rolesRef);

    if (snapshot.docs.length === 0) {
      console.log("ℹ️ No roles to clean up");
      return 0;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Cleaned up ${snapshot.docs.length} roles`);
    return snapshot.docs.length;
  } catch (error) {
    console.error("❌ Error cleaning up roles:", error);
    throw error;
  }
};

export const cleanupDepartmentsAndRoles = async (): Promise<{
  departments: number;
  roles: number;
}> => {
  try {
    console.log("🧹 Starting complete cleanup of departments and roles...");

    // Clean up roles first (they reference departments)
    const rolesCount = await cleanupAllRoles();

    // Then clean up departments
    const departmentsCount = await cleanupAllDepartments();

    console.log(
      `✅ Complete cleanup finished: ${departmentsCount} departments, ${rolesCount} roles`
    );
    return { departments: departmentsCount, roles: rolesCount };
  } catch (error) {
    console.error("❌ Error during complete cleanup:", error);
    throw error;
  }
};
