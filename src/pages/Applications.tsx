
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Eye, Calendar, MapPin, Building } from "lucide-react";

const Applications = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
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
      fetchApplications(user.id);
    };
    getUser();
  }, [navigate]);

  const fetchApplications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            company,
            location,
            job_type,
            salary_range
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const applied = new Date(date);
    const diffInHours = Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60));
    
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
          <div className="text-center">Loading your applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Track the status of your job applications</p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
              <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{application.jobs.title}</CardTitle>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        <span className="text-sm">{application.jobs.company}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{application.jobs.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{application.jobs.job_type}</Badge>
                      {application.jobs.salary_range && (
                        <Badge variant="outline">{application.jobs.salary_range}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied {timeAgo(application.created_at)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/jobs/${application.jobs.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Job
                      </Button>
                    </div>
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

export default Applications;
