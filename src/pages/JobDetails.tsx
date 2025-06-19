
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Building, Clock, DollarSign, Users, Heart, Send } from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (user && job) {
      checkIfApplied();
      checkIfSaved();
    }
  }, [user, job]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', id)
        .single();

      if (data) setHasApplied(true);
    } catch (error) {
      // User hasn't applied yet
    }
  };

  const checkIfSaved = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', id)
        .single();

      if (data) setIsSaved(true);
    } catch (error) {
      // Job not saved yet
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to apply for jobs",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          job_id: id,
          cover_letter: coverLetter,
          status: 'pending'
        }]);

      if (error) throw error;

      setHasApplied(true);
      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save jobs",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', id);

        if (error) throw error;
        setIsSaved(false);
        toast({
          title: "Success",
          description: "Job removed from saved jobs",
        });
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{ user_id: user.id, job_id: id }]);

        if (error) throw error;
        setIsSaved(true);
        toast({
          title: "Success",
          description: "Job saved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Job not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                    <div className="flex items-center text-gray-600 mt-2">
                      <Building className="h-5 w-5 mr-2" />
                      <span className="text-lg">{job.company}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveJob}
                    className={`${isSaved ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                  >
                    <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                  <Clock className="h-4 w-4 ml-4 mr-1" />
                  <span>Posted {timeAgo(job.created_at)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
                  {job.experience_level && <Badge variant="outline">{job.experience_level}</Badge>}
                  {job.category && <Badge variant="outline">{job.category}</Badge>}
                </div>
                
                {job.salary_range && (
                  <div className="flex items-center text-green-600 font-semibold mt-4">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary_range}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
                
                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apply for this job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasApplied ? (
                  <div className="text-center py-4">
                    <div className="text-green-600 font-semibold mb-2">✓ Application Submitted</div>
                    <p className="text-sm text-gray-600">You have already applied for this position.</p>
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => navigate('/applications')}
                    >
                      View Applications
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                      <Textarea
                        id="cover-letter"
                        placeholder="Tell us why you're interested in this position..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={handleApply} 
                      disabled={applying}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {applying ? "Applying..." : "Apply Now"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Company Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate(`/companies?search=${encodeURIComponent(job.company)}`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Jobs at {job.company}
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

export default JobDetails;
