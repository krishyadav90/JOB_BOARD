
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SavedJobs = () => {
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
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
      fetchSavedJobs(user.id);
    };
    getUser();
  }, [navigate]);

  const fetchSavedJobs = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          jobs (
            id,
            title,
            company,
            location,
            job_type,
            experience_level,
            category,
            salary_range,
            description,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedJobs(data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Loading your saved jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-600 mt-2">Jobs you've saved for later</p>
        </div>

        {savedJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">You haven't saved any jobs yet.</p>
              <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((savedJob) => (
              <JobCard key={savedJob.id} job={savedJob.jobs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
