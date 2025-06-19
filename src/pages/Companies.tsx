import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Building, MapPin, Briefcase, Search } from "lucide-react";

interface CompanyData {
  name: string;
  jobCount: number;
  locations: string[];
}

const Companies = () => {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchCompanies();
    };
    getUser();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('company, location')
        .order('company');

      if (error) throw error;

      // Group jobs by company and get job counts
      const companyMap: { [key: string]: CompanyData } = {};
      data?.forEach(job => {
        if (!companyMap[job.company]) {
          companyMap[job.company] = {
            name: job.company,
            jobCount: 0,
            locations: []
          };
        }
        companyMap[job.company].jobCount++;
        if (job.location && !companyMap[job.company].locations.includes(job.location)) {
          companyMap[job.company].locations.push(job.location);
        }
      });

      const companiesArray = Object.values(companyMap);
      setCompanies(companiesArray);
      setFilteredCompanies(companiesArray);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.locations.some(location => 
        location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleViewJobs = (companyName: string) => {
    navigate(`/jobs?company=${encodeURIComponent(companyName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Loading companies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-2">Discover companies that are actively hiring</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No companies found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {company.locations.length > 1 
                              ? `${company.locations[0]} +${company.locations.length - 1} more`
                              : company.locations[0] || 'Location not specified'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {company.jobCount} open position{company.jobCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Badge variant="secondary">{company.jobCount} jobs</Badge>
                    </div>
                    
                    <Button 
                      onClick={() => handleViewJobs(company.name)}
                      className="w-full"
                      variant="outline"
                    >
                      View Jobs
                    </Button>
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

export default Companies;
