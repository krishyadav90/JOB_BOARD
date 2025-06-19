
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveJob = async (e) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save jobs",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    const { error } = await supabase
      .from('saved_jobs')
      .insert([{ user_id: user.id, job_id: job.id }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    } else {
      setIsSaved(true);
      toast({
        title: "Success",
        description: "Job saved successfully",
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

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold hover:text-blue-600 transition-colors">
              {job.title}
            </CardTitle>
            <div className="flex items-center text-gray-600 mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span className="text-sm">{job.company}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveJob}
            className={`${isSaved ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{job.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {job.job_type && (
              <Badge variant="secondary">{job.job_type}</Badge>
            )}
            {job.experience_level && (
              <Badge variant="outline">{job.experience_level}</Badge>
            )}
            {job.category && (
              <Badge variant="outline">{job.category}</Badge>
            )}
          </div>
          
          {job.salary_range && (
            <div className="text-green-600 font-semibold">
              {job.salary_range}
            </div>
          )}
          
          <CardDescription className="line-clamp-2">
            {job.description}
          </CardDescription>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {timeAgo(job.created_at)}
            </div>
            <Button size="sm" onClick={(e) => {
              e.stopPropagation();
              navigate(`/jobs/${job.id}`);
            }}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
