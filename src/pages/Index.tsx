
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building, Clock, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";

const Index = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Fetch jobs
    fetchJobs();

    return () => subscription.unsubscribe();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (data) setJobs(data);
  };

  const handleSearch = async () => {
    let query = supabase.from('jobs').select('*');
    
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setJobs(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Dream Job Today
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and ambitions.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSearch} className="px-8 bg-blue-600 hover:bg-blue-700">
                Search Jobs
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50,000+</div>
              <div className="text-gray-600">Job Seekers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
            <p className="text-gray-600">Discover the latest opportunities from top companies</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/jobs')}
              className="px-8"
            >
              View All Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-600">Everything you need to find your perfect job</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Top Companies</CardTitle>
                <CardDescription>
                  Connect with leading companies across various industries
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Career Growth</CardTitle>
                <CardDescription>
                  Find opportunities that align with your career goals and aspirations
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Easy Application</CardTitle>
                <CardDescription>
                  Apply to multiple jobs with just a few clicks using your profile
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Career Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have found their dream jobs through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="px-8"
            >
              Find Jobs
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/post-job')}
              className="px-8 text-white border-white hover:bg-white hover:text-blue-600"
            >
              Post a Job
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
