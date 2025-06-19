
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, Eye, Trash2 } from "lucide-react";

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        navigate('/auth');
        return;
      }
      fetchNotifications(user.id);
    };
    getUser();
  }, [navigate]);

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map((notif: any) => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.filter((notif: any) => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading notifications...</div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your job applications and account activity
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <Card 
                key={notification.id} 
                className={`${!notification.is_read ? 'border-blue-200 bg-blue-50' : ''} hover:shadow-md transition-shadow`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${!notification.is_read ? 'text-blue-600' : 'text-gray-400'}`}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{notification.title || 'Notification'}</CardTitle>
                        <CardDescription className="mt-1">
                          {notification.message}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    {timeAgo(notification.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
