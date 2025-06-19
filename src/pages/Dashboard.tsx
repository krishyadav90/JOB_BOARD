
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { useNavigate } from "react-router-dom";
import { Briefcase, Heart, FileText, Bell, TrendingUp, Users, Building } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    notifications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    
    setUser(session.user);
    await Promise.all([
      fetchProfile(session.user.id),
      fetchStats(session.user.id),
      fetchRecentJobs()
    ]);
  };

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  const fetchStats = async (userId) => {
    const [applications, savedJobs, notifications] = await Promise.all([
      supabase.from('applications').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('saved_jobs').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', userId).eq('is_read', false)
    ]);

    setStats({
      applications: applications.count || 0,
      savedJobs: savedJobs.count || 0,
      notifications: notifications.count || 0
    });
  };

  const fetchRecentJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (data) setRecentJobs(data);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || user.email}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your job search</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/applications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications}</div>
              <p className="text-xs text-muted-foreground">
                Total applications submitted
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/saved-jobs')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedJobs}</div>
              <p className="text-xs text-muted-foreground">
                Jobs saved for later
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/notifications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notifications}</div>
              <p className="text-xs text-muted-foreground">
                Unread notifications
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Recent Jobs */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Job Postings</CardTitle>
                  <Button variant="outline" onClick={() => navigate('/jobs')}>
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Latest opportunities that might interest you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to help with your job search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/jobs')}
                  >
                    <Briefcase className="h-6 w-6 mb-2" />
                    Search Jobs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/profile')}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    Update Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/companies')}
                  >
                    <Building className="h-6 w-6 mb-2" />
                    Browse Companies
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/applications')}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    My Applications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>
                  Complete your profile to get better job matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basic Info</span>
                    <Badge variant={profile?.full_name ? "default" : "secondary"}>
                      {profile?.full_name ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resume</span>
                    <Badge variant={profile?.resume_url ? "default" : "secondary"}>
                      {profile?.resume_url ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/profile')}
                  >
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Job Recommendations</CardTitle>
                <CardDescription>
                  Based on your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your profile to get personalized job recommendations
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/profile')}
                  >
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
